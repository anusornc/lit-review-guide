import type { Metadata } from "next";
import GuideClient from "./guide-client";

const siteOrigin = (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = `${siteOrigin}${basePath}`;
const socialImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  description: "Choose a defensible literature review method from your research intent, discipline, evidence, and intended contribution.",
  applicationName: "LitWise",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "LitWise — Literature Review Expert Guide",
    description: "Find the literature review method your question needs.",
    type: "website",
    url: siteUrl,
    images: [{ url: socialImage, width: 1732, height: 908, alt: "LitWise literature review expert guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LitWise — Literature Review Expert Guide",
    description: "Find the literature review method your question needs.",
    images: [socialImage],
  },
};

export default function Home() {
  return <GuideClient initialLocale="en" initialTheme="light" />;
}
