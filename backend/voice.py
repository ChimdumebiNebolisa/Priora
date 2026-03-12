"""
Gemini Live API integration — WebSocket proxy and session handling.
System prompt injection lives here (GUARDRAILS: single place).
"""

import asyncio
import json
import logging
import os

from google import genai
from google.genai import types

from case_data import CASE

logger = logging.getLogger(__name__)

LIVE_MODEL = "gemini-2.0-flash-live-001"
INPUT_AUDIO_MIME = "audio/pcm;rate=16000"


def _system_instruction_content():
    """Build system instruction with full case JSON so the agent answers from case data only."""
    prompt = """You are a prior authorization assistant for a brain MRI clinic. You have access to exactly one case. Answer only from the case data below. Do not make up details, clinical judgments, or payer decisions. Keep answers concise and actionable.

Case data (JSON):
"""
    prompt += json.dumps(CASE, indent=2)
    return types.Content(parts=[types.Part(text=prompt)])


async def run_voice_proxy(websocket):
    """
    Bidirectional proxy: browser WebSocket <-> Gemini Live API.
    On connection open: open Gemini session with full case JSON in system prompt.
    Forward browser binary (PCM) to Gemini; forward Gemini audio to browser.
    Close Gemini session when browser disconnects (GUARDRAILS: clean up).
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        logger.error("GEMINI_API_KEY not set; closing voice WebSocket")
        try:
            await websocket.send_text(json.dumps({"error": "GEMINI_API_KEY not set"}))
        except Exception:
            pass
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
        return

    client = genai.Client(api_key=api_key.strip())
    config = {
        "response_modalities": ["AUDIO"],
        "system_instruction": _system_instruction_content(),
    }

    try:
        async with client.aio.live.connect(model=LIVE_MODEL, config=config) as session:
            browser_closed = asyncio.Event()
            gemini_done = asyncio.Event()

            async def browser_to_gemini():
                try:
                    while True:
                        data = await websocket.receive_bytes()
                        if not data:
                            break
                        await session.send_realtime_input(
                            audio=types.Blob(data=data, mime_type=INPUT_AUDIO_MIME)
                        )
                except Exception as e:
                    logger.info("browser_to_gemini stopped: %s", e)
                finally:
                    browser_closed.set()

            async def gemini_to_browser():
                try:
                    async for msg in session.receive():
                        if browser_closed.is_set():
                            break
                        if msg.server_content and msg.server_content.model_turn:
                            for part in msg.server_content.model_turn.parts or []:
                                if (
                                    hasattr(part, "inline_data")
                                    and part.inline_data
                                    and part.inline_data.data
                                ):
                                    try:
                                        await websocket.send_bytes(part.inline_data.data)
                                    except Exception as e:
                                        logger.warning("send_bytes to browser failed: %s", e)
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.info("gemini_to_browser stopped: %s", e)
                finally:
                    gemini_done.set()

            send_task = asyncio.create_task(browser_to_gemini())
            recv_task = asyncio.create_task(gemini_to_browser())
            done, _ = await asyncio.wait(
                [send_task, recv_task], return_when=asyncio.FIRST_COMPLETED
            )
            for t in (send_task, recv_task):
                if not t.done():
                    t.cancel()
                    try:
                        await t
                    except asyncio.CancelledError:
                        pass
    except Exception as e:
        logger.exception("Voice proxy error: %s", e)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass


async def run_live_spike():
    """
    Minimal async spike: open Gemini Live session, inject system prompt with case JSON,
    send one text message, receive and log response (audio or text).
    Confirms the SDK and API work before wiring the WebSocket proxy.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        raise ValueError("GEMINI_API_KEY is not set. Set it in .env or environment to run the voice spike.")

    client = genai.Client(api_key=api_key.strip())
    config = {
        "response_modalities": ["AUDIO"],
        "system_instruction": _system_instruction_content(),
    }

    async with client.aio.live.connect(model=LIVE_MODEL, config=config) as session:
        await session.send_client_content(
            turns=types.Content(parts=[types.Part(text="What is the status of Maria's case?")]),
            turn_complete=True,
        )
        audio_chunks = []
        async for msg in session.receive():
            if msg.server_content and msg.server_content.model_turn:
                for part in msg.server_content.model_turn.parts or []:
                    if hasattr(part, "inline_data") and part.inline_data and part.inline_data.data:
                        audio_chunks.append(part.inline_data.data)
                        logger.info("Received audio chunk: %d bytes", len(part.inline_data.data))
            if getattr(msg, "text", None):
                logger.info("Response text: %s", msg.text)

        if audio_chunks:
            total = sum(len(c) for c in audio_chunks)
            logger.info("Total audio response bytes: %d (%d chunks)", total, len(audio_chunks))
        else:
            logger.info("No audio chunks in response (check model/config)")

    return audio_chunks
