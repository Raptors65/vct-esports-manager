import type { Metadata } from "next";
import localFont from 'next/font/local'
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamForge",
  description:
    "An LLM-powered digital assistant designed to help you build a VALORANT esports team.",
};

const valorantFont = localFont({
  src: '../fonts/Valorant Font.ttf',
  display: 'swap',
  variable: '--font-val'
});

const bodyFont = localFont({
  src: '../fonts/dinnextw1g.otf',
  display: 'swap',
  variable: '--font-val-body'
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA" className={`${valorantFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
