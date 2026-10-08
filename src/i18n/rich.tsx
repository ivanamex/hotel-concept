import { Fragment } from "react";

/** Renders a dictionary string: "*text*" → <em>, "\n" → <br />. Works in server and client components. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*|\n)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) =>
        p === "\n" ? <br key={i} /> : p.length > 2 && p.startsWith("*") && p.endsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** The same string without the markers, for alt texts, titles and aria labels. */
export function plain(text: string): string {
  return text.replace(/\*/g, "").replace(/\n/g, " ");
}
