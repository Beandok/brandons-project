# Side A

A virtual listening room for physically owned music, built with Next.js 16, React, and TypeScript. Enter a Discogs username to display the public collection as a shelf or gallery.

## Run locally

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Try `/demo` for a self-contained example with original illustrative sleeve artwork, or `/collection/YOUR_USERNAME` for a live collection.

## Features

- Public Discogs collection import, including vinyl, CD, and cassette
- Shelf and gallery layouts; walnut, cream, and charcoal walls
- Artist, album, and genre search; format filtering and sorting
- Random next-listen selection and copyable room links
- Exact release links, image fallbacks, responsive layouts, and accessible controls
- Hourly server caching, request timeouts, and friendly import errors

The import currently displays up to 1,000 releases. Enable public collection browsing in Discogs privacy settings. Collection changes can take up to an hour to appear. This app displays the Discogs collection; it cannot independently verify physical ownership.

## Environment

Public collections can be read without credentials. An optional server-only `DISCOGS_TOKEN` can be set in `.env.local` or your hosting provider's environment settings for Discogs API authentication. Do not commit tokens. Authentication/database variables in `.env.example` belong to the retained starter and are not needed by Side A.

## Validate and deploy

```sh
npm run lint
npm run build
npm start
```

Import this GitHub repository into Vercel using its Next.js preset, or use a Node.js host with the production commands above. This is a server-rendered app and is not a static GitHub Pages export. Share room links using the deployed site's address.

Collection metadata and cover images are provided by [Discogs](https://www.discogs.com). The demo uses original illustrations, not actual album covers. This project is not affiliated with Discogs.
