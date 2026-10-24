# Common Ground

A symptom-based bioenergetic research companion built with Next.js 16, TypeScript and Tailwind CSS. The homepage is a new app; earlier music routes remain in the repository as legacy work.

## Run

`npm install`, then `npm run dev`. Open http://localhost:3000.

Three source-grounded prepared guides work without credentials: hair loss, urticaria/itching, and menstrual/uterine cramps. They are explicitly labeled as prepared, not live AI. The homepage starts with one question rather than an unsolicited example answer. It presents a concise overview, Peat's position, clinical evidence and uncertainty; mechanisms, competing explanations and source summaries expand on demand.

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
- `src/lib/research/sources.ts`: original summaries, keyword ranking, focused guide selection and safety gates.
- `src/lib/research/topics.ts`: source summaries, three prepared guides and pattern-specific mechanism variants.
- `src/lib/research/retrieval.ts`: optional pgvector/keyword search.
- `scripts/ingest.mjs`, `data/schema.sql`: approved ingestion and database setup.

## Verification

`npm run build`

`node scripts/check-research.mjs`

## Deploy on Vercel

Import this GitHub repository using the Next.js preset. Add environment variables in Vercel for live services. Without them the curated preview is usable. Rebuild after environment changes.

This is a research MVP, not a validated medical service. Keyword screening is incomplete and cannot rule out emergencies. Generated citation IDs are checked against retrieved sources, but automatic ID checks do not prove that a citation entails a claim. Broader clinical coverage, structured claim-level evidence review, adversarial safety evaluation, rate limiting/abuse protection and an appropriate privacy review are needed before a public health product launch. There are no supplement doses or diagnostic scores. Diagrams are prepared educational models selected for the topic/pattern, never AI-inferred personal diagnoses. Pattern thinning uses a miniaturization model; diffuse shedding uses a hair-cycle model; hives are not always assumed to be heat-triggered.

## Focused source coverage

16 original editorial summaries link to identifiable Peat articles, specialist guidance, clinical reviews and experimental studies. Peat entries include a locator into the original article. Source dates are left undated when publication timing is not established; a check date is not a publication date. Regenerate the approved ingestion seed with `node scripts/check-research.mjs --export-seed`, then re-run ingestion to update PostgreSQL. Focused retrieval always retains a Peat primary-author summary and clinical comparators, even when a database is configured but stale.

## PeatBot comparisons

No verified public PeatBot API is connected. The optional comparison field accepts up to 3,000 characters of pasted AI output. It goes to the model provider only when live AI is enabled and is explicitly unverified comparison data, never a source or a Peat quotation. In prepared mode, no evaluation of the pasted answer is claimed. Never paste private health or third-party identifying information unnecessarily.

Live responses must separately cite Peat's position and clinical evidence, with validation against retrieved IDs and attribution categories. Citation validation is not entailment verification: human evaluation is still needed. Unsupported and multi-topic questions do not silently receive a prepared answer for the wrong concern. Pregnancy with pelvic pain takes a prompt-care path before any model call; this keyword screening remains incomplete, not a validated triage system.
