import Link from "next/link";
import { CollectionWall } from "@/components/collection-wall";
import { UsernameForm } from "@/components/username-form";
import { DiscogsError, getDiscogsCollection } from "@/lib/discogs";
export async function CollectionView({ username }: { username: string }) {
  let collection;
  try {
    collection = await getDiscogsCollection(username);
  } catch (error) {
    return <div className="error-page"><Link className="wordmark" href="/">◉ SIDE A</Link><h1>Couldn’t open that room.</h1><p>{error instanceof DiscogsError ? error.message : "Discogs is unavailable right now. Please try again shortly."}</p><UsernameForm/><Link href="/demo">Explore the demo room ↗</Link></div>;
  }
    return <div className="collection-page"><nav className="site-nav"><Link className="wordmark" href="/">◉ SIDE A<span>A home for your collection</span></Link><Link href="/">Create your room ↗</Link></nav><header className="collection-header"><div><p className="eyebrow">THE LISTENING ROOM / PUBLIC COLLECTION</p><h1>{collection.username}<em>’s room.</em></h1><p>{collection.reportedTotal.toLocaleString()} owned releases{collection.location ? ` · ${collection.location}` : ""}</p></div><UsernameForm initialUsername={collection.username} compact /></header>{collection.truncated && <p className="notice">Displaying the first 1,000 releases from this collection.</p>}<CollectionWall albums={collection.albums}/></div>;
}

