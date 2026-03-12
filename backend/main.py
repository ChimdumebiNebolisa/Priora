"""FastAPI app — health, case, and voice routes."""

from fastapi import FastAPI, WebSocket

from case_data import CASE
from voice import run_voice_proxy

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/case")
def get_case():
    return CASE


@app.websocket("/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    await run_voice_proxy(websocket)
