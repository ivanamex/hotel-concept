import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Back office", template: "%s · Office · Maison Vidy" },
  robots: { index: false, follow: false },
};

export default function OfficeLayout({ children }: LayoutProps<"/office">) {
  return <div className="min-h-screen bg-[#f5f6f8]">{children}</div>;
}
