/** The Swiss flag — a red square with a white cross, drawn to the official 32:32 / 6:20 proportions. */
export function SwissCross({ className = "h-3 w-3", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : "true"}>
      {title && <title>{title}</title>}
      <rect width="32" height="32" rx="1.5" fill="#DA291C" />
      <path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff" />
    </svg>
  );
}
