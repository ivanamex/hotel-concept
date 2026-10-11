/**
 * The switchboard. One client = one of these files: which places exist, which home sections run and in what order,
 * which features the site has at all. Nav, footer, the next-page chain and the home page all read it,
 * so a feature switched off here disappears everywhere at once.
 */

export type HomeSection = "places" | "experiences" | "film" | "offers" | "reviews" | "locations" | "closing" | "knockout";

export interface SiteConfig {
  brand: {
    name: string;
    /** More than one place → the home page is the brand page and each place has its own landing. */
    multiPlace: boolean;
  };
  /** Property ids in the order they are shown. */
  places: string[];
  home: {
    /** Which film the brand hero tries first; the entrance film is the fallback. */
    film: string[];
    sections: HomeSection[];
  };
  features: {
    experiences: boolean;
    offers: boolean;
    dining: boolean;
    gallery: boolean;
    /** "Ask for the whole site / house" requests. */
    wholePlace: boolean;
    /** The stay-in-touch lightbox with the direct-booking code. */
    newsletter: boolean;
    /** Winter / Summer mode switch in the menu. */
    seasonSwitch: boolean;
    /** The ticker strip under the hero. */
    ticker: boolean;
    /** The WhatsApp button. */
    whatsapp: boolean;
  };
}

export const SITE: SiteConfig = {
  brand: { name: "Maison Vidy", multiPlace: true },
  places: ["vidy", "cabanes"],
  home: {
    film: ["/videos/brand.mp4", "/videos/entrance.mp4"],
    sections: ["places", "experiences", "film", "offers", "reviews", "locations", "closing", "knockout"],
  },
  features: {
    experiences: true,
    offers: true,
    dining: true,
    gallery: true,
    wholePlace: true,
    newsletter: true,
    seasonSwitch: true,
    ticker: true,
    whatsapp: true,
  },
};

/** Internal nav keys that exist for this site, in menu order. */
export function navKeys(): string[] {
  const f = SITE.features;
  const keys = ["home"];
  if (SITE.brand.multiPlace) keys.push("maison", "cabanes");
  else keys.push("rooms");
  if (f.experiences) keys.push("experiences");
  if (f.dining) keys.push("dining");
  if (f.offers) keys.push("offers");
  if (f.gallery) keys.push("gallery");
  keys.push("contact");
  return keys;
}
