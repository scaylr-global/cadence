# Cadence — AI Sales Follow-Up Agent

A working prototype for the Catalist Media builder challenge (Option 2).
Reads each lead's conversation, classifies it (warm / cold / delayed / unclear / lost),
scores it, drafts the next message, and **holds high-stakes replies for a human**
instead of auto-sending.

The six sample leads work with no setup. The "Run a new lead through the agent"
box makes a live Claude call through a serverless function that keeps your API key
off the browser.

---

## Deploy to a public link (Vercel) — ~10 minutes

### 1. Put it on GitHub
```bash
git init
git add .
git commit -m "Cadence — AI sales follow-up agent"
```
Create a new empty repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cadence.git
git push -u origin main
```

### 2. Import to Vercel
- Go to vercel.com → **Add New → Project** → import the repo.
- Framework preset: **Vite** (auto-detected). Leave build settings as-is.

### 3. Add your key (this is what keeps it secure)
- In the import screen (or Project → Settings → Environment Variables) add:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** your key from console.anthropic.com → API Keys
- Click **Deploy**.

You get a live URL like `https://cadence-xxxx.vercel.app` — that's your demo link
for the email.

---

## Run locally (optional)
```bash
npm install
npm run dev
```
The sample leads work immediately. For the live AI box locally, use
`vercel dev` (so the /api function runs), or just demo the live box from the
deployed URL.

---

## How it works
- **Frontend:** React + Vite + Tailwind (`src/App.jsx`)
- **Live AI:** `api/analyze.js` — a serverless function that forwards the prompt
  to the Claude API with your key server-side, so the browser never sees it.
- **Model:** claude-sonnet-4-6

## Security notes (worth saying in the Loom)
- The API key lives only in Vercel's environment variables, never in the client bundle.
- The six sample leads are static, so the demo never breaks on a network hiccup —
  the live box proves it's real AI; the samples prove reliability.
