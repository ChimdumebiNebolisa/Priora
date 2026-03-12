# Priora

Prior authorization command center for brain MRI cases.

## Setup

1. Clone the repo.
2. Backend: `cd backend`, create a virtualenv, run `pip install -r requirements.txt`, set `GEMINI_API_KEY` in `.env` (copy from `.env.example`).
3. Frontend: `cd frontend`, run `npm install`.

## Running locally

**Backend**

From the repo root:
```bash
cd backend
uvicorn main:app --reload
```
Server runs at http://127.0.0.1:8000.

**Verify endpoints**

- `GET http://127.0.0.1:8000/health` — returns `{"status": "ok"}`.
- `GET http://127.0.0.1:8000/case` — returns full synthetic case JSON (patient, procedure, auth_episode, payer_requirements, blockers, next_action, ai_summary, timeline, risk_signal, stages).

**Frontend**

From the repo root:
```bash
cd frontend
npm run dev
```
Dev server runs at http://localhost:5173. Open in browser to see the app.

## Deployment

(Placeholder — deployment steps will be added.)
