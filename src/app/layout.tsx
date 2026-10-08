import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hotel-concept.vercel.app"),
  title: {
    default: "Maison Vidy · Lakeside boutique hotel in Lausanne",
    template: "%s · Maison Vidy",
  },
  description:
    "Ten rooms in a lakeside house in Vidy, Lausanne. Book direct for the best rate, breakfast on the terrace, and a concierge one message away.",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Maison Vidy",
    images: [{ url: "/images/lake/hero-lake.jpg", width: 1600, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
