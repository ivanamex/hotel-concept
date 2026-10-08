import { notFound } from "next/navigation";

/** Anything under /[lang] that no page matches → the language's own 404. */
export default function CatchAll() {
  notFound();
}
