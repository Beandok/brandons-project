"use client";

import { useState } from "react";
import type { Album } from "@/lib/discogs";
import { type MediaKind, physicalFormats } from "@/lib/media-format";

export function PhysicalMedia({ album, kind }: { album: Album | null; kind: MediaKind }) {
  const [failed, setFailed] = useState(false);
  const spec = physicalFormats[kind];
  const source = album?.coverImage;
  return <div className={`physical-media physical-${kind}`}>
    <div className="media-depth" aria-hidden="true" />
    <div className="media-package">
      <div className="media-artwork">
        {source && !failed ? (
          // Signed Discogs URLs remain unchanged; contain preserves the whole image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={source} alt={`${album.artist} - ${album.title}`} loading="lazy" onError={() => setFailed(true)} />
        ) : <div className="unprinted-insert"><span>{spec.label}</span><small>{failed ? "Cover unavailable" : "Packaging study"}</small></div>}
      </div>
      <span className="package-hinge" aria-hidden="true" />
      <span className="package-rim" aria-hidden="true" />
      <span className="package-seam" aria-hidden="true" />
    </div>
  </div>;
}
