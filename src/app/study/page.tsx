import { Suspense } from "react";
import Link from "next/link";
import { ArchiveStudy } from "@/components/archive-study";
import { getDiscogsCollection, isValidDiscogsUsername } from "@/lib/discogs";
import { studySelection, type MediaKind } from "@/lib/media-format";
import type { Album } from "@/lib/discogs";
import "./study.css";

export const metadata = { title: "The Illuminated Archive — Side A / Material Study" };
const kinds: MediaKind[] = ["vinyl", "cd", "cassette"];

export default function StudyPage(props: { searchParams: Promise<{ username?: string | string[] }> }) {
  return <main className="illuminated-archive">
    <nav className="archive-nav"><Link href="/" className="archive-brand">SIDE A <span>THE PHYSICAL MUSIC ARCHIVE</span></Link><Link href="/collection/aufhebean">Return to collection ↗</Link></nav>
    <header className="archive-introduction"><div><p className="archive-kicker">A STUDY IN LIGHT, MATTER & MUSIC</p><h1>The illuminated<br /><em>archive.</em></h1></div><div className="archive-preface"><span className="archive-ornament" aria-hidden="true">✧</span><p>A place for the things we keep.<br />Three physical forms, held in a quiet light.</p><span>VOLUME I — MATERIAL & PROPORTION</span></div></header>
    <Suspense fallback={<div className="study-loading" role="status">Opening the archive. Looking for your collection covers…</div>}><StudyContents searchParams={props.searchParams} /></Suspense>
    <footer className="archive-colophon"><p>William Blake shapes the world around the music.<br />The music retains its own identity.</p><Link href="/">SIDE A / A PERSONAL ARCHIVE</Link><span>Material study · First edition</span></footer>
  </main>;
}

async function StudyContents({ searchParams }: { searchParams: Promise<{ username?: string | string[] }> }) {
  const params = await searchParams;
  const raw = typeof params.username === "string" ? params.username : "aufhebean";
  const username = raw.trim().replace(/^@/, "");
  let albums: Album[] = [];
  let notice = "";
  if (!isValidDiscogsUsername(username)) notice = "Enter a valid Discogs username to load collection covers.";
  else {
    try { albums = (await getDiscogsCollection(username)).albums; }
    catch { notice = "Your Discogs covers could not be loaded from this server. The objects below are unprinted packaging studies, not records claimed to be in your collection."; }
  }
  const samples = kinds.map(kind => ({kind, album: studySelection(albums, kind)}));
  const loaded = samples.filter(sample => sample.album).length;
  return <>
    <div className="archive-source"><form action="/study"><label htmlFor="study-username">Collection /</label><input id="study-username" name="username" defaultValue={username} aria-label="Discogs username" maxLength={41}/><button>Load covers ↗</button></form><p>{loaded}/3 collection covers loaded · Original images, unfiltered</p></div>
    {notice && <p className="archive-notice" role="status">{notice}</p>}
    {!notice && loaded < 3 && <p className="archive-notice">A format without an available, conventional-package release is shown as an unprinted study. Box sets and mixed-format packages are not substituted.</p>}
    <ArchiveStudy samples={samples} />
    <section className="material-notes" aria-label="Material notes"><article><span>01 / SLEEVE</span><h2>Paper, held in light.</h2><p>A full-size LP jacket, a fine cardboard edge, and a protective sleeve. The light lives along the seam, away from the artwork.</p></article><article><span>02 / CASE</span><h2>A smaller architecture.</h2><p>A CD case at 45% of the LP’s width. A dark hinge, a clear rim, and restrained edge reflections describe its material.</p></article><article><span>03 / INSERT</span><h2>An intimate rectangle.</h2><p>A cassette case at 32% of the LP’s width. Its printed insert sits inside the case without stretching or cropping the source image.</p></article></section>
  </>;
}
