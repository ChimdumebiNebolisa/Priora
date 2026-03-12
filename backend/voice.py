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


def _system_instruction_content():
    """Build system instruction with full case JSON so the agent answers from case data only."""
    prompt = """You are a prior authorization assistant for a brain MRI clinic. You have access to exactly one case. Answer only from the case data below. Do not make up details, clinical judgments, or payer decisions. Keep answers concise and actionable.

Case data (JSON):
"""
    prompt += json.dumps(CASE, indent=2)
    return types.Content(parts=[types.Part(text=prompt)])


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
