import { useState, useRef, useCallback } from 'react'

// Backend/Gemini contract: input must be 16 kHz 16-bit PCM.
const SAMPLE_RATE_IN = 16000
// Gemini Live API output is 24 kHz 16-bit PCM; backend forwards as-is. Isolate here for easy adjustment.
const SAMPLE_RATE_OUT = 24000
const BUFFER_SIZE = 4096

/** Resample float32 samples to 16 kHz 16-bit PCM for backend/Gemini contract. */
function resampleTo16k(float32Samples, sourceSampleRate) {
  if (float32Samples.length === 0) return new Int16Array(0)
  if (sourceSampleRate === SAMPLE_RATE_IN) {
    const pcm = new Int16Array(float32Samples.length)
    for (let i = 0; i < float32Samples.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Samples[i]))
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return pcm
  }
  const outLength = Math.max(1, Math.round((float32Samples.length * SAMPLE_RATE_IN) / sourceSampleRate))
  const pcm = new Int16Array(outLength)
  const lastIn = float32Samples.length - 1
  const lastOut = outLength - 1
  for (let i = 0; i < outLength; i++) {
    const srcIdx = lastOut > 0 ? (i * lastIn) / lastOut : 0
    const idx0 = Math.floor(srcIdx)
    const idx1 = Math.min(idx0 + 1, float32Samples.length - 1)
    const t = srcIdx - idx0
    const s = float32Samples[idx0] * (1 - t) + float32Samples[idx1] * t
    const clamped = Math.max(-1, Math.min(1, s))
    pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff
  }
  return pcm
}

function VoiceButton() {
  const [status, setStatus] = useState('idle') // idle | connecting | listening | speaking
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const playbackContextRef = useRef(null)
  const processorRef = useRef(null)
  const sourceRef = useRef(null)
  const nextPlayTimeRef = useRef(0)

  const stopCapture = useCallback(() => {
    if (processorRef.current && sourceRef.current) {
      try {
        sourceRef.current.disconnect()
        processorRef.current.disconnect()
      } catch (_) {}
    }
    processorRef.current = null
    sourceRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
      playbackContextRef.current.close()
      playbackContextRef.current = null
    }
  }, [])

  const closeWs = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch (_) {}
      wsRef.current = null
    }
  }, [])

  const handleStop = useCallback(() => {
    stopCapture()
    closeWs()
    setStatus('idle')
    setError(null)
  }, [stopCapture, closeWs])

  const playAudioChunk = useCallback((context, int16Data) => {
    const numSamples = int16Data.length
    const buffer = context.createBuffer(1, numSamples, SAMPLE_RATE_OUT)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < numSamples; i++) {
      channel[i] = int16Data[i] / 32768
    }
    const startTime = Math.max(nextPlayTimeRef.current, context.currentTime)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + buffer.duration
  }, [])

  const handleClick = useCallback(async () => {
    if (status === 'listening' || status === 'connecting' || status === 'speaking') {
      handleStop()
      return
    }

    setError(null)
    setStatus('connecting')

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/voice`
    let ws
    try {
      ws = new WebSocket(wsUrl)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws
    } catch (e) {
      setError(e.message || 'WebSocket failed')
      setStatus('idle')
      return
    }

    ws.onopen = async () => {
      setStatus('listening')
      nextPlayTimeRef.current = 0

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const context = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = context

        const source = context.createMediaStreamSource(stream)
        sourceRef.current = source

        // ScriptProcessorNode is deprecated but avoids AudioWorklet + separate file for this MVP.
        const processor = context.createScriptProcessor(BUFFER_SIZE, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (e) => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) return
          const input = e.inputBuffer.getChannelData(0)
          const actualRate = e.inputBuffer.sampleRate
          const pcm = resampleTo16k(input, actualRate)
          wsRef.current.send(pcm.buffer)
        }

        const dest = context.createMediaStreamDestination()
        source.connect(processor)
        processor.connect(dest)
      } catch (e) {
        setError(e.message || 'Microphone access failed')
        handleStop()
      }
    }

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.error) {
            setError(data.error)
            closeWs()
            stopCapture()
            setStatus('idle')
          }
        } catch (_) {}
        return
      }
      if (event.data instanceof ArrayBuffer && event.data.byteLength > 0) {
        setStatus('speaking')
        const int16 = new Int16Array(event.data)
        let playCtx = playbackContextRef.current
        if (!playCtx || playCtx.state === 'closed') {
          playCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: SAMPLE_RATE_OUT,
          })
          playbackContextRef.current = playCtx
          nextPlayTimeRef.current = 0
        }
        playAudioChunk(playCtx, int16)
      }
    }

    ws.onerror = () => {
      setError('WebSocket error')
    }

    ws.onclose = (event) => {
      if (!event.wasClean) {
        if (event.code === 1011) {
          setError((e) => e || 'Voice service unavailable')
        } else if (event.code !== 1000) {
          setError((e) => e || 'Connection closed')
        }
      }
      closeWs()
      stopCapture()
      setStatus('idle')
    }
  }, [status, handleStop, closeWs, stopCapture, playAudioChunk])

  const label =
    status === 'connecting'
      ? 'Connecting…'
      : status === 'listening'
        ? 'Listening (click to stop)'
        : status === 'speaking'
          ? 'Speaking…'
          : 'Mic'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          status === 'listening' || status === 'connecting'
            ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }`}
        aria-label={status === 'listening' ? 'Stop microphone' : 'Voice assistant'}
      >
        {label}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}

export default VoiceButton
