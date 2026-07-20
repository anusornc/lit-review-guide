import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const isThai = requestHeaders.get("accept-language")?.toLowerCase().startsWith("th") ?? false;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: isThai ? "LitWise — คู่มือผู้เชี่ยวชาญด้านการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
    description: isThai ? "เลือกวิธีทบทวนวรรณกรรมที่ปกป้องได้จากเป้าหมายการวิจัย สาขาวิชา หลักฐาน และคุณูปการที่ต้องการ" : "Choose a defensible literature review method from your research intent, discipline, evidence, and intended contribution.",
    applicationName: "LitWise",
    openGraph: {
      title: isThai ? "LitWise — คู่มือการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
      description: isThai ? "ค้นหาวิธีทบทวนที่เหมาะกับคำถามวิจัยของคุณ" : "Find the literature review method your question needs.",
      type: "website",
      images: [{ url: socialImage, width: 1740, height: 909, alt: "LitWise literature review expert guide" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isThai ? "LitWise — คู่มือการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
      description: isThai ? "ค้นหาวิธีทบทวนที่เหมาะกับคำถามวิจัยของคุณ" : "Find the literature review method your question needs.",
      images: [socialImage],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const language = requestHeaders.get("accept-language")?.toLowerCase().startsWith("th") ? "th" : "en";
  return (
    <html lang={language}>
      <body>{children}</body>
    </html>
  );
}
