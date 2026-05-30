# Deploying Delta Connector (Render)

Both services deploy from this repo via the root `render.yaml` blueprint.
Backend = FastAPI (Python), Frontend = TanStack Start SSR (Node).

## One-time deploy

1. Push to GitHub (already done if you see this in the repo).
2. Go to https://dashboard.render.com -> **New +** -> **Blueprint**.
3. Connect the `delta-connector` repo. Render reads `render.yaml` and proposes
   two services: `delta-connector-api` and `delta-connector-web`.
4. Click **Apply**. Both build and deploy on the free plan.

## Wire the two URLs together (after first deploy)

The services need each other's URLs. After they go live, set these env vars
(Dashboard -> service -> Environment), then trigger a redeploy of each:

- **delta-connector-api** -> `ALLOWED_ORIGINS` = the frontend URL
  (e.g. `https://delta-connector-web.onrender.com`). CORS reads this.
- **delta-connector-web** -> `VITE_API_BASE` = the backend URL
  (e.g. `https://delta-connector-api.onrender.com`).

> `VITE_API_BASE` is inlined at **build time**, so after setting it you must
> redeploy the web service (Manual Deploy -> Clear build cache & deploy) so the
> new value is baked into the client bundle.

Order that avoids the chicken-and-egg: deploy both once, copy each URL, set the
two vars, redeploy both. ~2 minutes.

## Free-tier notes

- Free web services sleep after ~15 min idle; first request after sleep is slow
  (cold start). Fine for a demo; hit both URLs once right before presenting.
- Backend data is file-based + an in-memory fit counter, so "answer fits" bumps
  and any /contribute writes reset when the instance restarts. Expected for the
  demo.

## Local sanity check (optional)

Backend:  `cd backend && uvicorn app:app --port 8000`
Frontend: `cd frontend && npm run build && node dist/server/index.mjs`
          (set `VITE_API_BASE` before building to point at a non-local API)
