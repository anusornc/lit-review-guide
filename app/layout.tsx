import Script from "next/script";
import "./globals.css";
import { resolveLocalePreference, resolveThemePreference } from "./preferences";

const preferenceScript = `(function(){try{var resolveLocale=${resolveLocalePreference.toString()};var resolveTheme=${resolveThemePreference.toString()};var queryLocale=new URLSearchParams(location.search).get("lang");var storedLocale=localStorage.getItem("litwise-language");var browserLanguage=navigator.language||"";var storedTheme=localStorage.getItem("litwise-theme");var prefersDark=matchMedia("(prefers-color-scheme: dark)").matches;var locale=resolveLocale(queryLocale,storedLocale,browserLanguage);var theme=resolveTheme(storedTheme,prefersDark);document.documentElement.lang=locale;document.documentElement.dataset.locale=locale;document.documentElement.dataset.theme=theme;}catch(error){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-locale="en" data-theme="light" suppressHydrationWarning>
      <body>
        <Script id="litwise-preferences" strategy="beforeInteractive">{preferenceScript}</Script>
        {children}
      </body>
    </html>
  );
}
