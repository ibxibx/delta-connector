# Deployment

Two pieces deploy separately: the **backend** (this repo, on Render) and the **frontend**
(Lovable's own publish). Then point the frontend's `API_BASE` at the deployed backend URL.

## Backend → Render (free)

The repo includes `render.yaml`, so Render picks up the config automatically.

1. Push to GitHub (already done).
2. Go to https://render.com → New → **Blueprint** → connect the `ibxibx/delta-connector` repo.
   Render reads `render.yaml` and creates the `delta-connector-api` web service.
   (Or: New → Web Service → set root dir `backend`, build `pip install -r requirements.txt`,
   start `uvicorn app:app --host 0.0.0.0 --port $PORT`.)
3. Deploy. You'll get a public URL like `https://delta-connector-api.onrender.com`.
4. Verify: open `<url>/` (should return `{"status":"ok"}`) and `<url>/docs` (interactive API).
5. After the frontend is published, set the **ALLOWED_ORIGINS** env var in the Render dashboard
   to the Lovable frontend URL (e.g. `https://your-app.lovable.app`) and redeploy. Until then it
   defaults to `*` so nothing is blocked during development.

Free-tier note: the service sleeps after ~15 min idle and takes ~30–60s to wake on the first
request. Before the live demo, hit the URL once to wake it.

## Frontend → Lovable

1. Build the screens using `docs/LOVABLE_PROMPTS.md`.
2. Set `API_BASE` to the Render URL (not localhost) so the published frontend reaches the backend.
3. Use Lovable's Publish to get a public frontend URL.
4. Put that URL into the backend's `ALLOWED_ORIGINS` (step 5 above).

## Demo-day persistence note

The `/answer-fits` bump is held in an **in-memory overlay** (`agents/fit_store.py`), not written to
disk — so it works on Render's ephemeral filesystem and survives a read-only host. It resets if the
service restarts (including the free-tier sleep/wake). That's fine for a single demo session: do the
"mark answer fits → number goes up" beat without restarting the service in between. The seed baselines
in `answers.json` / `activity.json` are always present regardless.

## Quick local check before deploying
```
cd backend
pip install -r requirements.txt
python ../tests/test_agents.py          # 14/14 should pass
uvicorn app:app --reload                # then open http://localhost:8000/docs
```
