import { defineRouting } from "next-intl/routing";

export const locales = ["en", "uk"] as const;

export const defaultLocale = "en" as const;

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't prefix URLs for the default locale
  localePrefix: "as-needed",
});
