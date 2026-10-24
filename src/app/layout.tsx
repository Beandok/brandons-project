import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Common Ground — Physiology, with perspective',description:'A source-grounded bioenergetic research companion. Explore mechanisms, competing explanations and the limits of the evidence.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
