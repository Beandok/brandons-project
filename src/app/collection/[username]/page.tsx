import { Suspense } from "react";
import { CollectionView } from "@/components/collection-view";
import { isValidDiscogsUsername } from "@/lib/discogs";
import { UsernameForm } from "@/components/username-form";
function CollectionFallback() {
  return <div className="loading-room" role="status"><p className="eyebrow">OPENING YOUR LISTENING ROOM</p><h1>Unpacking your records...</h1><div className="loading-shelves">{Array.from({length:8},(_,i)=><div key={i}/>)}</div></div>;
}
export default function CollectionPage({ params }: PageProps<"/collection/[username]">) {
  return <main><Suspense fallback={<CollectionFallback/>}><ResolvedCollection params={params}/></Suspense></main>;
}
async function ResolvedCollection({params}:{params:PageProps<"/collection/[username]">["params"]}) {
  const {username} = await params;
  if (!isValidDiscogsUsername(username)) return <div className="error-page"><h1>That username looks off.</h1><p>Use your Discogs username with letters, numbers, dots, underscores, or dashes.</p><UsernameForm/></div>;
  return <CollectionView username={username}/>;
}
