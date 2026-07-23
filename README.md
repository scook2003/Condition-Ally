# ConditionAlly — deployment guide

This folder has two parts:
- `index.html` — the app people see and use
- `api/analyze.js` — a small server function that holds your API key privately and talks to Anthropic on the browser's behalf

Deploying both together (via Vercel) is the easiest path, since Vercel runs the `api/` folder as serverless functions automatically — no separate backend to manage.

## 1. Get an Anthropic API key
1. Go to https://console.anthropic.com and sign in (or create an account).
2. Add billing details (API usage is pay-as-you-go, separate from any Claude.ai subscription).
3. Go to **API Keys** and create a new key. Copy it somewhere safe — you won't be able to see it again.

## 2. Put this project on GitHub
1. Create a new repository on https://github.com (e.g. `conditionally`).
2. Upload these two files/folders into it (`index.html` and the `api/` folder), keeping the same structure.
   - Easiest way with no command line: on the repo page, click "Add file" → "Upload files", drag both in.

## 3. Deploy to Vercel
1. Go to https://vercel.com and sign up (you can sign in with your GitHub account).
2. Click "Add New… → Project" and import the GitHub repo you just created.
3. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste the key you copied in step 1)
4. Click **Deploy**. After a minute you'll get a live URL like `conditionally.vercel.app`.

That's it — anyone with that link can use the app, and your API key stays private on Vercel's servers the whole time.

## Notes on cost and safety
- Each photo analysis costs a small fraction of a cent to a few cents in API usage, billed to your Anthropic account.
- Because the link is public, anyone could use it and rack up usage. For a small personal project this is usually fine, but if it gets shared widely, consider:
  - Setting a spend limit on your API key in the Anthropic Console (Workspaces → spend limits).
  - Adding simple rate-limiting to `api/analyze.js` (e.g. via Vercel's KV store or a service like Upstash) to cap requests per visitor.
- To update the app later, just edit the files in GitHub — Vercel redeploys automatically.
