"""FastAPI app — health, case, and (later) voice routes."""

from fastapi import FastAPI

from case_data import CASE

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/case")
def get_case():
    return CASE
