import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  weight: ["500", "700"],
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
  weight: ["400", "500"],
});

const data = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data-face",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "CakeMatch",
  description: "Upload a cake photo. Get the spec. Find who can build it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${data.variable}`}>{children}</body>
    </html>
  );
}
