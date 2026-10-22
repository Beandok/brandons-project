import Link from "next/link";
import { CollectionWall } from "@/components/collection-wall";
import { UsernameForm } from "@/components/username-form";
import type { Album } from "@/lib/discogs";
const picks = [
  ["John Coltrane", "Blue Train", 1957, 7561, "Vinyl", "Jazz"],
  ["Sade", "Love Deluxe", 1992, 58944, "CD", "Soul"],
  ["Radiohead", "In Rainbows", 2007, 1158751, "Vinyl", "Rock"],
  ["Miles Davis", "Kind Of Blue", 1959, 225287, "Vinyl", "Jazz"],
  ["Cocteau Twins", "Heaven Or Las Vegas", 1990, 160668, "Cassette", "Dream Pop"],
  ["D'Angelo", "Voodoo", 2000, 115166, "Vinyl", "Soul"],
  ["Björk", "Vespertine", 2001, 30836, "CD", "Electronic"],
  ["Massive Attack", "Mezzanine", 1998, 10035, "Vinyl", "Electronic"],
] as const;
const albums: Album[] = picks.map(([artist,title,year,releaseId,format,genre],i)=>({instanceId:i+1,releaseId,artist,title,year,formats:[format],genres:[genre],coverImage:`/demo-art/${i+1}.svg`}));
export default function Demo() { return <main className="collection-page"><nav className="site-nav"><Link className="wordmark" href="/">◉ SIDE A<span>A home for your collection</span></Link><Link href="/">Create your room ↗</Link></nav><header className="collection-header"><div><p className="eyebrow">THE LISTENING ROOM / DEMO</p><h1>A room for<em> good records.</em></h1><p>An example collection with original illustrative artwork.</p></div><UsernameForm compact/></header><CollectionWall albums={albums}/></main>; }
