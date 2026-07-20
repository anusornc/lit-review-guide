import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: "LitWise — Literature Review Expert Guide",
    description: "Choose a defensible literature review method from your research intent, discipline, evidence, and intended contribution.",
    applicationName: "LitWise",
    openGraph: {
      title: "LitWise — Literature Review Expert Guide",
      description: "Find the literature review method your question needs.",
      type: "website",
      images: [{ url: socialImage, width: 1740, height: 909, alt: "LitWise literature review expert guide" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LitWise — Literature Review Expert Guide",
      description: "Find the literature review method your question needs.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
