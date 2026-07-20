import { cookies, headers } from "next/headers";
import "./globals.css";

function resolveDocumentLocale(requestLocale: string | null, cookieLocale: string | undefined, acceptLanguage: string | null) {
  if (requestLocale === "th" || requestLocale === "en") return requestLocale;
  if (cookieLocale === "th" || cookieLocale === "en") return cookieLocale;
  return acceptLanguage?.toLowerCase().startsWith("th") ? "th" : "en";
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()]);
  const language = resolveDocumentLocale(
    requestHeaders.get("x-litwise-language"),
    requestCookies.get("litwise-language")?.value,
    requestHeaders.get("accept-language"),
  );
  const theme = requestCookies.get("litwise-theme")?.value === "dark" ? "dark" : "light";
  return (
    <html lang={language} data-locale={language} data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem("litwise-theme");var t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
