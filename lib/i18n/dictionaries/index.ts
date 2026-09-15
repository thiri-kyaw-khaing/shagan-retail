import type { Locale } from "../config";
import en from "./en";
import mm from "./mm";
import zh from "./zh";

const dictionaries: Record<Locale, typeof en> = { en, mm, zh };

export default dictionaries;
