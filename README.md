# GSM Arena Proxy + Frontend (Vercel-ready)

This project contains a simple **frontend** (index.html) and two **serverless functions**
that run on Vercel (or Render). It allows searching GSMArena and viewing the full specs
inside a Bootstrap modal.

## Files

- `index.html` - Frontend (Bootstrap, bilingual Arabic/English)
- `api/search.js` - Serverless function. Call `/api/search?name=...`
- `api/phone.js` - Serverless function. Call `/api/phone?path=...`
- `package.json` - Node dependencies for Vercel (cheerio, node-fetch)

## Deploy on Vercel

1. Create a new project on Vercel and connect your git repository (or upload the ZIP).
2. Ensure Vercel uses Node 18 (package.json engines specify 18.x).
3. After deployment, open the project URL and use the search box.

> Note: Scraping or proxying content from other sites may be against their terms of service.
> Use responsibly.

