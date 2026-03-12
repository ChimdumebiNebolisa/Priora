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

**Voice agent**

The mic button opens a WebSocket to `/voice` and streams 16 kHz PCM from the browser to the backend; the backend proxies audio to the Gemini Live API and streams response audio back. Interruption (speaking over the agent) is handled by the Live API. Full verification (interruption behavior and case-grounded answers to e.g. “What is the status of Maria’s case?”, “What is blocking submission?”, “What do I need to do next?”) is **blocked on `GEMINI_API_KEY`** being set; once the key is available, run backend and frontend and test with the mic to confirm.

## Deployment

(Placeholder — deployment steps will be added.)
