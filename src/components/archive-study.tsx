"use client";

import { useRef, useState } from "react";
import type { Album } from "@/lib/discogs";
import { PhysicalMedia } from "./physical-media";
import { type MediaKind, packagingNotes, physicalFormats } from "@/lib/media-format";

type Sample = { kind: MediaKind; album: Album | null };
export function ArchiveStudy({ samples }: { samples: Sample[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<Sample>(samples[0]);
  function inspect(sample: Sample) { setActive(sample); dialog.current?.showModal(); }
  return <>
    <div className="archive-room">
      <div className="archive-firmament" aria-hidden="true"><div className="archive-orbit" /><span className="archive-star">✧</span></div>
      <div className="alcove-caption"><span>THE MATERIAL STUDIES</span><span>I / THREE FORMS, ONE SCALE</span></div>
      <div className="archive-cabinet">
        {samples.map((sample, index) => {
          const {kind, album} = sample;
          const spec = physicalFormats[kind];
          return <section className={`archive-bay bay-${kind}`} key={kind}>
            <div className="bay-index">0{index + 1} <span>{spec.label}</span></div>
            <div className="bay-display">
              <button className="object-inspect" aria-label={`Inspect ${album ? `${album.artist} - ${album.title}` : `${spec.label} packaging study`}`} onClick={() => inspect(sample)}><PhysicalMedia kind={kind} album={album} /></button>
              <div className="display-ledge" aria-hidden="true" />
            </div>
            <div className="bay-catalogue"><span className="dimension-rule">{spec.width}&quot; × {spec.height}&quot;</span><h2>{album?.title ?? `${spec.label} study`}</h2><p>{album?.artist ?? "No collection cover loaded"}</p><small>{album ? packagingNotes(album) : spec.material}</small><button onClick={() => inspect(sample)}>Inspect object <span aria-hidden="true">↗</span></button></div>
          </section>;
        })}
      </div>
      <div className="archive-room-footer"><span>Neutral artwork. Atmospheric surroundings.</span><span>All objects shown at the same relative scale.</span></div>
    </div>
    <dialog className="inspection-dialog" ref={dialog} aria-labelledby="inspection-title">
      <div className="inspection-heading"><span>OBJECT INSPECTION</span><button onClick={() => dialog.current?.close()} aria-label="Close object inspection">Close ×</button></div>
      <div className={`inspection-object inspect-${active.kind}`}><PhysicalMedia key={`${active.kind}-${active.album?.instanceId ?? "sample"}`} kind={active.kind} album={active.album} /></div>
      <h2 id="inspection-title">{active.album?.title ?? physicalFormats[active.kind].label}</h2><p>{active.album?.artist ?? "Unprinted packaging sample"}</p>
      <p className="inspection-description">{active.album ? packagingNotes(active.album) : physicalFormats[active.kind].material}</p>
      <p className="inspection-description">Enlarged for inspection. Packaging is a visual study; Discogs front-cover metadata does not verify the exact case construction.</p>
      {active.album && <a href={`https://www.discogs.com/release/${active.album.releaseId}`} target="_blank" rel="noreferrer">View this pressing on Discogs ↗</a>}
    </dialog>
  </>;
}
