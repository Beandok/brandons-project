import { cacheLife } from "next/cache";

const DISCOGS_API = "https://api.discogs.com";
const USER_AGENT =
  "BrandonsVinylWall/1.0 +https://github.com/Beandok/brandons-project";
const PER_PAGE = 100;
const MAX_PAGES = 10;

export type Album = {
  instanceId: number;
  releaseId: number;
  title: string;
  artist: string;
  year: number | null;
  coverImage: string | null;
  formats: string[];
  genres: string[];
};

export type CollectionView = {
  username: string;
  avatarUrl: string | null;
  location: string | null;
  reportedTotal: number;
  albums: Album[];
  truncated: boolean;
};

export class DiscogsError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "DiscogsError";
  }
}

type DiscogsUser = {
  username: string;
  avatar_url?: string;
  location?: string;
  num_collection?: number;
};

type DiscogsArtist = {
  name: string;
  join?: string;
};

type DiscogsFormat = {
  name: string;
  descriptions?: string[];
};

type DiscogsRelease = {
  instance_id: number;
  id: number;
  basic_information: {
    title: string;
    year?: number;
    cover_image?: string;
    thumb?: string;
    artists?: DiscogsArtist[];
    formats?: DiscogsFormat[];
    genres?: string[];
  };
};

type CollectionPage = {
  pagination: {
    pages: number;
    items: number;
  };
  releases: DiscogsRelease[];
};

function discogsHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.discogs.v2.discogs+json",
  };
  const token = process.env.DISCOGS_TOKEN;
  if (token) {
    headers.Authorization = `Discogs token=${token}`;
  }
  return headers;
}

async function discogsGet(path: string): Promise<Response> {
  try {
    return await fetch(`${DISCOGS_API}${path}`, {
      headers: discogsHeaders(),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new DiscogsError(
      "The server could not connect to Discogs. Check the server's internet connection and DNS access to api.discogs.com, then try again. Your username or collection privacy has not been verified.",
      503,
    );
  }
}

function cleanArtistName(name: string) {
  return name.replace(/\s+\(\d+\)$/, "");
}

function formatArtists(artists: DiscogsArtist[] | undefined) {
  if (!artists?.length) {
    return "Unknown artist";
  }

  return artists
    .map((artist, index) => {
      const name = cleanArtistName(artist.name);
      const join = artist.join?.trim();
      if (index === artists.length - 1) {
        return name;
      }
      if (join) {
        return `${name} ${join}`;
      }
      return `${name},`;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatLabels(formats: DiscogsFormat[] | undefined) {
  if (!formats?.length) {
    return [];
  }

  const labels = new Set<string>();
  for (const format of formats) {
    labels.add(format.name);
    for (const description of format.descriptions ?? []) {
      if (description !== "Album") {
        labels.add(description);
      }
    }
  }
  return [...labels];
}

function toAlbum(release: DiscogsRelease): Album {
  const info = release.basic_information;
  const cover = info.cover_image || info.thumb || null;

  return {
    instanceId: release.instance_id,
    releaseId: release.id,
    title: info.title,
    artist: formatArtists(info.artists),
    year: info.year || null,
    coverImage: cover && !cover.includes("spacer.gif") ? cover : null,
    formats: formatLabels(info.formats),
    genres: info.genres ?? [],
  };
}

async function fetchUser(username: string): Promise<DiscogsUser> {
  const response = await discogsGet(`/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    throw new DiscogsError(
      `No Discogs profile named “${username}” was found.`,
      404,
    );
  }

  if (!response.ok) {
    throw new DiscogsError(
      "Discogs did not return this profile. Try again in a minute.",
      response.status,
    );
  }

  return response.json() as Promise<DiscogsUser>;
}

async function fetchCollectionPage(username: string, page: number) {
  const response = await discogsGet(
    `/users/${encodeURIComponent(username)}/collection/folders/0/releases?page=${page}&per_page=${PER_PAGE}&sort=artist&sort_order=asc`,
  );

  if (response.status === 401 || response.status === 403) {
    throw new DiscogsError(
      "This collection is private or unavailable. Enable public collection browsing in Discogs privacy settings and try again.",
      response.status,
    );
  }

  if (response.status === 404) {
    throw new DiscogsError(
      `No public collection was found for “${username}”.`,
      404,
    );
  }

  if (!response.ok) {
    throw new DiscogsError(
      "Could not load this Discogs collection. Try again in a minute.",
      response.status,
    );
  }

  return response.json() as Promise<CollectionPage>;
}

export async function getDiscogsCollection(
  username: string,
): Promise<CollectionView> {
  "use cache";
  cacheLife("hours");

  const user = await fetchUser(username);
  const firstPage = await fetchCollectionPage(user.username, 1);
  const pagesToFetch = Math.min(firstPage.pagination.pages, MAX_PAGES);
  const releases = [...firstPage.releases];

  for (let page = 2; page <= pagesToFetch; page += 1) {
    const nextPage = await fetchCollectionPage(user.username, page);
    releases.push(...nextPage.releases);
  }

  return {
    username: user.username,
    avatarUrl: user.avatar_url ?? null,
    location: user.location || null,
    reportedTotal: firstPage.pagination.items,
    albums: releases.map(toAlbum),
    truncated: firstPage.pagination.pages > MAX_PAGES,
  };
}

export function isValidDiscogsUsername(username: string) {
  return /^[A-Za-z0-9._-]{1,40}$/.test(username);
}

