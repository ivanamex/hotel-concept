"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/i18n/context";
import { localePath } from "@/i18n/config";

/** next/link that writes internal paths ("/rooms/x") in the visitor's language. Office and API paths pass through. */
export function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const lang = useLang();
  const h = typeof href === "string" && !/^\/(office|api)(\/|$)/.test(href) ? localePath(lang, href) : href;
  return <NextLink href={h} {...rest} />;
}
