import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Side A — A home for your music collection",
  description: "Turn your physically owned vinyl, CDs, and cassettes into a virtual listening room with your Discogs collection.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
