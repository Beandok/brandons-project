# Common Ground

A symptom-based bioenergetic research companion built with Next.js 16, TypeScript and Tailwind CSS. The homepage is a new app; earlier music routes remain in the repository as legacy work.

## Run

`npm install`, then `npm run dev`. Open http://localhost:3000.

The curated heat/itching/taurine example works without credentials. It is labeled as curated, not live AI. Other questions retrieve matching summaries but do not receive invented case-specific explanations.

## Enable live synthesis

Copy `.env.example` to `.env.local`. Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`. Calls and credentials stay server-side. Submitted symptom text goes to the server and, when enabled, OpenAI. No conversations are written to the server database. Save buttons opt into browser-local storage; saved health text is accessible to other users of the same browser.

## Enable hybrid retrieval

Use a PostgreSQL database supporting pgvector and set `DATABASE_URL`. Run:

`node --env-file=.env.local scripts/ingest.mjs data/approved-documents.json`

The ingestion command creates the table, generates 1536-dimensional embeddings and upserts approved passages. It requires a permission category and source metadata. It never crawls a website. Retrieval combines vector and PostgreSQL full-text rankings with reciprocal rank fusion. Without both credentials, the app uses local keyword ranking. Provider/database failures fall back to the labeled curated experience.

Add passages only where original-summary, licensed or public-domain use is justified. Keep excerpts short; preserve author, source URL, evidence type and attribution category. A label alone does not grant permission. Interview timestamps must come from verified transcript records. Community emails require provenance and permission. Recipeats and Bioenergetic.life currently link out only.

## Architecture

- `src/app/page.tsx`: responsive conversational workspace, source library, device-local saves, mechanism explorer and theme switch.
- `src/app/api/research/route.ts`: input limits, initial safety screening, retrieval, server-side LLM call, output shape/citation-ID validation and honest fallback.
- `src/lib/research/sources.ts`: original summaries, keyword ranking, curated example and safety gate.
- `src/lib/research/retrieval.ts`: optional pgvector/keyword search.
- `scripts/ingest.mjs`, `data/schema.sql`: approved ingestion and database setup.

## Verification

`npm run build`

`node scripts/check-research.mjs`

## Deploy on Vercel

Import this GitHub repository using the Next.js preset. Add environment variables in Vercel for live services. Without them the curated preview is usable. Rebuild after environment changes.

This is a research MVP, not a validated medical service. Keyword screening is incomplete and cannot rule out emergencies. Generated citation IDs are checked against retrieved sources, but automatic ID checks do not prove that a citation entails a claim. Broader clinical coverage, structured claim-level evidence review, adversarial safety evaluation, rate limiting/abuse protection and an appropriate privacy review are needed before a public health product launch. There are no supplement doses or diagnostic scores. The diagram is a fixed illustrative case and never presented as a personalized inferred pathway.
