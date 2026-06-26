# Post-Wick

Social media on autopilot — brand crawl, AI post generation, approval queue, scheduling, and publishing.

## Monorepo

| Package | Description |
|---------|-------------|
| **`native-landing/`** | Main Next.js app (marketing site, app UI, API routes) |
| **`web-crawler/`** | Website crawl package (CLI subprocess integration) |

## Local development

```bash
cd native-landing
cp .env.example .env.local   # add your keys
npm install
npm run dev
```

App runs at `http://localhost:3000` (or the port Next assigns).

## Production stack (planned)

- **Vercel** — hosting
- **Neon** — Postgres (`DATABASE_URL`)
- **Vercel Blob** — generated post images
- **Clerk** — auth
- **Ideogram / OpenAI** — images
- **Anthropic** — post copy
- **Stripe** — billing

## License

Private — all rights reserved.
