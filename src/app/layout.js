import "./globals.css";

import { Manrope } from "next/font/google";

import { siteConfig } from "@/config/site";

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
