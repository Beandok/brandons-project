import Link from "next/link";
import { UsernameForm } from "@/components/username-form";

const sleeves = [
  { artist: "JOHN COLTRANE", title: "BLUE TRAIN", style: "blue", note: "The Blue Note collection" },
  { artist: "SADE", title: "LOVE DELUXE", style: "clay", note: "A little soul goes a long way" },
  { artist: "RADIOHEAD", title: "IN RAINBOWS", style: "orange", note: "For the late nights" },
  { artist: "MILES DAVIS", title: "KIND OF BLUE", style: "night", note: "Always in rotation" },
];
export default function Home() {
  return <main className="home-room">
    <nav className="site-nav"><Link className="wordmark" href="/">◉ SIDE A<span>A home for your collection</span></Link><a href="#how-it-works">How it works ↗</a></nav>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> FOR THE LOVE OF THE PHYSICAL</p><h1>Your music.<br />Off the shelf.<br /><em>On display.</em></h1><p className="intro">The records you hunted down. The CDs you grew up with. Give the music you own a room of its own.</p><UsernameForm /><p className="small-note">Powered by your public Discogs collection. No sign-up needed.</p><Link className="text-link" href="/demo">Take a look around the demo room <span>↗</span></Link></div>
      <div className="room-preview" aria-label="Illustrated record shelf preview"><div className="room-label">THE LISTENING ROOM <span>VOL. 001</span></div><div className="preview-records">{sleeves.map((s,i)=><div className="preview-item" key={s.title}><div className={`art-sleeve ${s.style}`}><span>{s.artist}</span><strong>{s.title}</strong><div className="art-shape" /><small>SIDE A / {String(i+1).padStart(2,"0")}</small></div><p>{s.note}</p></div>)}</div><div className="room-caption"><span>Good music deserves to be seen.</span><span>33⅓ RPM</span></div></div>
    </section>
    <section id="how-it-works" className="how"><div><p className="eyebrow">YOUR COLLECTION, REINTRODUCED</p><h2>Less scrolling.<br /><em>More crate digging.</em></h2></div><article><span>01 / CONNECT</span><h3>Bring your Discogs.</h3><p>Enter your username to bring in the music in your public collection, including vinyl, CDs, and cassettes.</p></article><article><span>02 / MAKE IT YOURS</span><h3>Set the mood.</h3><p>Choose a shelf or gallery, change the wall color, and sort through your records your way.</p></article><article><span>03 / SHOW & TELL</span><h3>Share your taste.</h3><p>Send someone your room link. Every cover leads back to the exact release on Discogs.</p></article></section>
    <footer><Link className="wordmark" href="/">◉ SIDE A</Link><p>A little space for the music that matters.</p><a href="https://www.discogs.com" target="_blank" rel="noreferrer">Collection data by Discogs ↗</a></footer>
  </main>;
}
