import type { Metadata, Viewport } from "next";

import { Analytics } from "@vercel/analytics/next";

import { MusicProvider } from "../lib/MusicContext";
import "./globals.css";

/** Canonical site URL for OG/Twitter metadata. Set in Vercel: NEXT_PUBLIC_SITE_URL=https://tophchen.com */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Keep in sync with the intro paragraphs in AboutNote.tsx */
const siteDescription =
  "Hey! I'm Toph — a computer science student at the University of Waterloo. I have a passion for building cool stuff that makes a real difference for the people using it. As a software engineer, I like moving fast, taking ownership of my work, and bringing ideas to life from start to finish. I build things that matter.";

const siteKeywords = [
  "Cristophe Chen",
  "Cristophe",
  "Toph Chen",
  "Toph",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Toph Chen",
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: "Toph Chen", url: "https://github.com/tophuu" }],
  openGraph: {
    title: "Toph Chen",
    description: siteDescription,
    type: "website",
    locale: "en_US",
    siteName: "Toph Chen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Toph Chen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toph Chen",
    description: siteDescription,
    creator: "@__tophu",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function personJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Toph Chen",
    alternateName: ["Cristophe Chen", "Cristophe"],
    url,
    sameAs: [
      "https://github.com/tophuu",
      "https://linkedin.com/in/toph-chen/",
      "https://www.instagram.com/__tophu/",
      "https://x.com/__tophu",
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bootstrapScript = `(function(){var b=document.body,V=['about','projects','contact'],SESSION_KEY='pref-session-last-seen',SESSION_MS=24*60*60*1000;try{var now=Date.now();var last=Number(localStorage.getItem(SESSION_KEY)||'0');if(!Number.isFinite(last)||now-last>SESSION_MS){for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf('pref-')===0){localStorage.removeItem(k)}}}localStorage.setItem(SESSION_KEY,String(now));var w=localStorage.getItem('pref-wallpaper');if(w)b.dataset.wallpaper=w;var t=localStorage.getItem('pref-theme');if(t==='black'||t==='white')b.dataset.notesTheme=t;var n=localStorage.getItem('pref-active-note');if(n&&V.indexOf(n)>=0)b.dataset.activeNote=n}catch(e){}b.classList.add('no-transition')})()`;
  return (
    <html lang="en">
      <body data-wallpaper="big-sur" data-notes-theme="white" data-active-note="about" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: bootstrapScript }}
        />
        <MusicProvider>
          {children}
        </MusicProvider>
        <Analytics />
      </body>
    </html>
  );
}
