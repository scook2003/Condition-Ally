# ConditionAlly

**Live app:** https://condition-ally-mm5g.vercel.app/

ConditionAlly helps people explore how AI and assistive technology can support day-to-day management of a health condition. Pick a condition (or type your own), and get concrete, practical ideas — not a diagnosis, not medical advice, just everyday things that might help.

Built as a personal, non-commercial project. **No cost to use, no ads, no revenue.**

---

## What it does

- **Condition dropdown** — 11 preset conditions, each with:
  - AI-generated idea cards (practical, everyday suggestions)
  - Assistive technology recommendations
  - "Good to avoid" warnings
- **Free-text condition entry** — type any condition; typo-tolerant matching (Levenshtein distance) catches misspellings and matches them to the closest known condition
- **AI-generated suggestions** for conditions not in the preset list
- **Photo analysis** — upload a photo for AI-assisted analysis, with client-side image resizing so it works reliably on mobile
- **Scoped Q&A** — ask follow-up questions; the assistant stays on-topic and declines questions unrelated to the condition/support context
- **Clickable detail modals** — click any idea card for a fuller explanation
- **Privacy page** — clear statement of what is and isn't collected
- **No cost / no ads / no revenue notice** — shown prominently in the app

---

## Tech stack

- **Front end:** single-file `index.html` (HTML/CSS/JavaScript, no framework, no build step)
- **Back end:** Vercel serverless functions, one per feature:
  - `api/analyze.js` — photo analysis
  - `api/ask.js` — scoped Q&A
  - `api/detail.js` — detail modal content
  - `api/suggest.js` — suggestions for free-text/unlisted conditions
- **AI:** Anthropic API (Claude), called server-side only — the API key never reaches the browser
- **Hosting:** Vercel, auto-deploys on every GitHub commit

---

## Project structure

```
conditionally/
  index.html
  README.md
  api/
    analyze.js
    ask.js
    detail.js
    suggest.js
```

> ⚠️ **This folder must be lowercase `api`**, not `API`. On GitHub, a capital-letter folder name causes every serverless function to 404 on Vercel — this cost a lot of debugging time to track down. Always double-check the folder name is exactly `api` (all lowercase) before uploading.

---

## Deployment (no command line needed)

This project is designed to be deployed entirely through web browsers — GitHub's web UI and the Vercel dashboard.

### 1. Get an Anthropic API key
1. Go to **console.anthropic.com** and sign in (separate from any claude.ai login)
2. Add a payment method if prompted — usage is pay-as-you-go, fractions of a cent per request
3. In the sidebar, click **API Keys → Create Key**
4. **Copy the key immediately** — it's shown only once

### 2. Upload to GitHub
1. Go to **github.com**, sign in
2. Click **+ → New repository**, name it `conditionally`
3. On the empty repo page, click **Add file → Upload files**
4. Drag in `index.html`, `README.md`, and the whole `api` folder (drag the folder itself so GitHub keeps the structure)
5. Scroll down, click **Commit changes**

### 3. Deploy on Vercel
1. Go to **vercel.com → Sign Up → Continue with GitHub**
2. Click **Add New… → Project**, import the `conditionally` repo
3. Expand **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key from step 1
4. Click **Deploy** — you'll get a live URL (this project's is `condition-ally-mm5g.vercel.app`)

### Making future updates
1. Edit the file(s) you need (usually easiest to edit the **full** `index.html` rather than partial snippets)
2. In GitHub, open the file, click the pencil (edit) icon
3. Paste in the full updated content
4. Commit changes directly to the `main` branch
5. Vercel auto-redeploys within a minute or two
6. Hard-refresh the live site with **Ctrl+Shift+R** to see the change (browsers cache aggressively otherwise)

---

## Cost & safety notes

Since the app is public, anyone with the link can use it and generate API costs on your Anthropic account. Two easy safety nets:
- Set a **spend limit** on the API key in the Anthropic Console
- Add basic rate-limiting later if traffic grows beyond a small personal-project level

Neither is urgent for current usage, but worth knowing they're there.

---

## Lessons learned building this

- **Folder casing matters on GitHub/Vercel.** A capital `API` folder instead of lowercase `api` caused persistent 404s across every serverless function — non-obvious and expensive to debug.
- **Resize photos client-side before upload.** Large mobile photos were causing JSON parse errors; resizing on a canvas before sending fixed it.
- **Check file contents before every commit.** A sensitive value was accidentally pasted into a file and committed — required deleting the whole repo and rebuilding from clean files. Always review a file's contents in the editor before clicking Commit.
- **Document the "why," not just the "what."** For anyone evaluating this project (employers, collaborators), explaining the reasoning behind a technical decision demonstrates more judgement than the feature itself.

---

## Disclaimer

ConditionAlly is an informational tool, not a medical device. It does not diagnose, treat, or replace advice from a qualified healthcare professional. Always consult a doctor or relevant specialist for medical concerns.
