# Free Deployment Guide — GG Maidan

Deploy the full stack for **free** using:
| Part | Service | Cost |
|---|---|---|
| API server + Database | [Render](https://render.com) | Free (server sleeps after 15 min idle) |
| Main website | [Netlify](https://netlify.com) | Free |
| Admin panel | [Netlify](https://netlify.com) | Free (separate site) |

---

## Step 1 — Push code to GitHub

1. Go to [github.com](https://github.com) → **New repository** → name it `gg-maidan` → **Create**
2. Copy the repo URL (e.g. `https://github.com/yourusername/gg-maidan`)
3. In Replit, open the **Git** pane (left sidebar) → connect the remote → push

---

## Step 2 — Deploy the API server on Render

1. Go to [render.com](https://render.com) → sign up / log in with GitHub
2. Click **New** → **Blueprint**
3. Connect your `gg-maidan` GitHub repo → Render will detect `render.yaml` automatically
4. Click **Apply** — Render creates:
   - A **web service** (`gg-maidan-api`) for the Express API
   - A **PostgreSQL database** (`gg-maidan-db`) — free, lasts 90 days
5. Once deployed, go to the service → **Environment** tab → add:
   - `ADMIN_PASSWORD` = your admin password
6. Copy the service URL — it looks like `https://gg-maidan-api.onrender.com`

> **Note:** The free database expires after 90 days. Upgrade to a paid plan or migrate to [Supabase](https://supabase.com) (free forever) before then.

---

## Step 3 — Deploy the main website on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Connect your `gg-maidan` GitHub repo
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `pnpm install && pnpm --filter @workspace/gg-maidan run build`
   - Publish directory: `artifacts/gg-maidan/dist`
4. Go to **Site settings** → **Environment variables** → add:
   - `VITE_API_URL` = `https://gg-maidan-api.onrender.com` (your Render URL from Step 2)
5. Trigger a redeploy — your site is live!
6. Optionally set a custom domain (ggmaidan.com) in **Domain settings**

---

## Step 4 — Deploy the admin panel on Netlify

1. On Netlify → **Add new site** → **Import from Git** (same repo, different site)
2. Set build settings **manually** in the Netlify UI:
   - **Base directory**: (leave blank)
   - **Build command**: `pnpm install && pnpm --filter @workspace/gg-maidan-admin run build`
   - **Publish directory**: `artifacts/gg-maidan-admin/dist`
3. Go to **Environment variables** → add:
   - `VITE_API_URL` = `https://gg-maidan-api.onrender.com`
4. Deploy — your admin panel is live at a Netlify URL

---

## Environment variables summary

| Variable | Where | Value |
|---|---|---|
| `DATABASE_URL` | Render (auto-set) | PostgreSQL connection string |
| `SESSION_SECRET` | Render (auto-generated) | Random secret |
| `ADMIN_PASSWORD` | Render (set manually) | Your admin password |
| `VITE_API_URL` | Both Netlify sites | `https://gg-maidan-api.onrender.com` |

---

## Local development

Everything still works on Replit as before. `VITE_API_URL` is not set in dev so API calls stay root-relative (`/api/...`) and go through the Replit proxy.

To run locally:
```bash
# Copy and fill in .env
cp .env.example .env

# Install dependencies
pnpm install

# Start all services (3 separate terminals)
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/gg-maidan run dev
pnpm --filter @workspace/gg-maidan-admin run dev
```
