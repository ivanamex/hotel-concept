import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Back office", template: "%s · Office · Maison Vidy" },
  robots: { index: false, follow: false },
};

export default function OfficeLayout({ children }: LayoutProps<"/office">) {
  return <div className="min-h-screen bg-[#f5f6f8] font-sans [--font-display:var(--font-caps)] [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans [&_.font-display]:font-sans [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_.font-display]:font-semibold [&_h1]:tracking-tight [&_h2]:tracking-tight">{children}</div>;
}
