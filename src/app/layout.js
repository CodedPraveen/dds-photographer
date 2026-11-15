import "./globals.css";

import localFont from "next/font/local";

import { siteConfig } from "@/config/site";

const manrope = localFont({
  src: "../assets/fonts/Manrope-Variable.ttf",
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  weight: "400 700",
});

export const metadata = {
  metadataBase: siteConfig.url,
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
