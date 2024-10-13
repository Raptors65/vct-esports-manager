import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamForge",
  description:
    "An LLM-powered digital assistant designed to help you build a VALORANT esports team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
