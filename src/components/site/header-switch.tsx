"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./header";

const OVERLAY = new Set(["/", "/experiences", "/dining", "/gallery", "/offers"]);

export function HeaderSwitch() {
  const pathname = usePathname();
  return <SiteHeader overlay={OVERLAY.has(pathname)} />;
}
