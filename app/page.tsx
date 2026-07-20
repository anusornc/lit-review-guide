import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import GuideClient from "./guide-client";
import type { Locale } from "./i18n";

type PageProps = { searchParams: Promise<{ lang?: string }> };

function resolveLocale(parameter: string | undefined, cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (parameter === "th" || parameter === "en") return parameter;
  if (cookie === "th" || cookie === "en") return cookie;
  return acceptLanguage?.toLowerCase().startsWith("th") ? "th" : "en";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const [params, requestCookies, requestHeaders] = await Promise.all([searchParams, cookies(), headers()]);
  const locale = resolveLocale(params.lang, requestCookies.get("litwise-language")?.value, requestHeaders.get("accept-language"));
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = new URL("/og.png", `${protocol}://${host}`).toString();
  const isThai = locale === "th";

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: isThai ? "LitWise — คู่มือผู้เชี่ยวชาญด้านการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
    description: isThai ? "เลือกวิธีทบทวนวรรณกรรมที่เหมาะสมจากเป้าหมายการวิจัย สาขาวิชา ลักษณะหลักฐาน และผลลัพธ์ที่ต้องการ" : "Choose a defensible literature review method from your research intent, discipline, evidence, and intended contribution.",
    applicationName: "LitWise",
    openGraph: {
      title: isThai ? "LitWise — คู่มือการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
      description: isThai ? "ค้นหาวิธีทบทวนที่เหมาะกับคำถามวิจัยของคุณ" : "Find the literature review method your question needs.",
      type: "website",
      images: [{ url: socialImage, width: 1732, height: 908, alt: "LitWise literature review expert guide" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isThai ? "LitWise — คู่มือการทบทวนวรรณกรรม" : "LitWise — Literature Review Expert Guide",
      description: isThai ? "ค้นหาวิธีทบทวนที่เหมาะกับคำถามวิจัยของคุณ" : "Find the literature review method your question needs.",
      images: [socialImage],
    },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const [params, requestCookies, requestHeaders] = await Promise.all([searchParams, cookies(), headers()]);
  const initialLocale = resolveLocale(params.lang, requestCookies.get("litwise-language")?.value, requestHeaders.get("accept-language"));
  const initialTheme = requestCookies.get("litwise-theme")?.value === "dark" ? "dark" : "light";

  return <GuideClient initialLocale={initialLocale} initialTheme={initialTheme} />;
}
