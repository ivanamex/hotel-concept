"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { DEFAULT_LANG, localePath, type Lang } from "./config";
import { en, type Dict } from "./en";

const Ctx = createContext<{ lang: Lang; t: Dict } | null>(null);

export function LangProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <Ctx.Provider value={{ lang, t: dict }}>{children}</Ctx.Provider>;
}

/** Current language; English where there is no provider (the office). */
export function useLang(): Lang {
  return useContext(Ctx)?.lang ?? DEFAULT_LANG;
}

/** The dictionary of the current language. */
export function useT(): Dict {
  return useContext(Ctx)?.t ?? en;
}

/** Turns an internal path ("/rooms/x") into the public one for the current language. */
export function useHref() {
  const lang = useLang();
  return useCallback((internal: string) => localePath(lang, internal), [lang]);
}
