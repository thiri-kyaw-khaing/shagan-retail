"use client";

import dictionaries from "./dictionaries";
import { useLocale } from "./locale-context";

type TranslationKey = keyof (typeof dictionaries)["en"];

export function useTranslation() {
  const { locale } = useLocale();
  const dictionary = dictionaries[locale];

  const t = (key: TranslationKey) => dictionary[key] ?? dictionaries.en[key];

  return { t, locale };
}
