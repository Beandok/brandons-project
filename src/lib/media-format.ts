import type { Album } from "./discogs";

export type MediaKind = "vinyl" | "cd" | "cassette";
export const physicalFormats = {
  vinyl: { label: "Vinyl", width: 12.375, height: 12.375, material: "Cardboard jacket / protective outer sleeve" },
  cd: { label: "Compact disc", width: 5.6, height: 4.9, material: "Clear jewel case / hinged spine" },
  cassette: { label: "Cassette", width: 4, height: 2.75, material: "Clear cassette case / folded insert" },
} as const;

// Keep media types separate from descriptions such as LP, Album, or Box Set.
export function hasMediaFormat(album: Album, kind: MediaKind) {
  const names = album.formatDetails?.map(format => format.name) ?? album.formats;
  return names.some(name => kind === "vinyl" ? /^(vinyl|lp)$/i.test(name)
    : kind === "cd" ? /^cd(?:r|-r)?$/i.test(name) : /^cassette$/i.test(name));
}

export function packagingNotes(album: Album) {
  if (!album.formatDetails?.length) return album.formats.join(", ");
  return album.formatDetails.map(format => [
    format.quantity && format.quantity > 1 ? `${format.quantity} x ${format.name}` : format.name,
    ...format.descriptions,
    format.text,
  ].filter(Boolean).join(", ")).join(" / ");
}

export function studySelection(albums: Album[], kind: MediaKind) {
  // Prefer an unambiguous single-format pressing; never pretend a mixed set
  // or an explicitly different package is a conventional LP / jewel case.
  return albums.find(album => {
    if (!hasMediaFormat(album, kind) || !album.coverImage) return false;
    const kinds = (["vinyl", "cd", "cassette"] as const).filter(k => hasMediaFormat(album, k));
    const notes = packagingNotes(album);
    if (kinds.length !== 1 || /box set|digipak|digisleeve|cardboard sleeve/i.test(notes)) return false;
    if (kind === "vinyl" && /7\"|10\"/i.test(notes) && !/12\"|\bLP\b/i.test(notes)) return false;
    return true;
  }) ?? null;
}
