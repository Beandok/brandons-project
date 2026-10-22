"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useId, useState, useTransition } from "react";
export function UsernameForm({ initialUsername = "", compact = false }: { initialUsername?: string; compact?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = username.trim();
    if (!/^[A-Za-z0-9._-]{1,40}$/.test(value)) { setError("Enter a Discogs username using letters, numbers, dots, dashes, or underscores."); return; }
    setError(""); startTransition(()=>router.push(`/collection/${encodeURIComponent(value)}`));
  }
  return <form className={`username-form ${compact ? "compact" : ""}`} onSubmit={submit}><label htmlFor={id} className="sr-only">Discogs username</label><div className="username-entry"><span aria-hidden="true">@</span><input id={id} name="username" autoComplete="username" placeholder="Your Discogs username" value={username} onChange={e=>setUsername(e.target.value)} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error}/><button disabled={pending}>{pending ? "Opening…" : compact ? "Open room ↗" : "Build my room ↗"}</button></div>{error && <p role="alert" id={`${id}-error`} className="form-error">{error}</p>}</form>;
}
