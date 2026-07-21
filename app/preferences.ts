export type Locale = "en" | "th";
export type Theme = "light" | "dark";

export function resolveLocalePreference(
  queryLocale: string | null | undefined,
  storedLocale: string | null | undefined,
  browserLanguage: string | null | undefined,
): Locale {
  if (queryLocale === "th" || queryLocale === "en") return queryLocale;
  if (storedLocale === "th" || storedLocale === "en") return storedLocale;
  return browserLanguage?.toLowerCase().startsWith("th") ? "th" : "en";
}

export function resolveThemePreference(
  storedTheme: string | null | undefined,
  prefersDark: boolean,
): Theme {
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return prefersDark ? "dark" : "light";
}
