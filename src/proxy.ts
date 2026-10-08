import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, LOCALES, internalSegments, isLang, type Lang } from "@/i18n/config";

const COOKIE = "mv-lang";
const PASS = /^\/(office|api|_next|images|videos|favicon|robots\.txt|sitemap\.xml|icon|opengraph-image)/;

function preferred(req: NextRequest): Lang {
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return DEFAULT_LANG;
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PASS.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  const segs = pathname.split("/").filter(Boolean);
  const first = segs[0];

  // prefixed: /fr/chambres/... → internal /fr/rooms/...
  if (isLang(first) && first !== DEFAULT_LANG) {
    const internal = internalSegments(first, segs.slice(1));
    const url = req.nextUrl.clone();
    url.pathname = `/${first}${internal.length ? "/" + internal.join("/") : ""}`;
    const res = NextResponse.rewrite(url);
    res.cookies.set(COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }
  // /en/... is not a public URL — send to the bare path
  if (first === DEFAULT_LANG) {
    const url = req.nextUrl.clone();
    url.pathname = `/${segs.slice(1).join("/")}`;
    return NextResponse.redirect(url, 308);
  }

  // first visit on the home page: follow the browser language once
  if (segs.length === 0) {
    const cookie = req.cookies.get(COOKIE)?.value;
    if (!cookie) {
      const want = preferred(req);
      if (want !== DEFAULT_LANG) {
        const url = req.nextUrl.clone();
        url.pathname = `/${want}`;
        const res = NextResponse.redirect(url);
        res.cookies.set(COOKIE, want, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
        return res;
      }
    }
  }

  // default language, unprefixed → internal /en/...
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  const res = NextResponse.rewrite(url);
  if (!req.cookies.get(COOKIE)) res.cookies.set(COOKIE, DEFAULT_LANG, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

export { LOCALES };
