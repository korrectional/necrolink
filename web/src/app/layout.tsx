import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NecroLink: The Living Terminal & Digital Ofrenda",
  description: "Bridging forgotten open-source repositories and living memory through glowing candlelit altars and spectral terminal possession.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-stone-950 text-stone-100 antialiased selection:bg-amber-500 selection:text-stone-950">
        <div className="papel-banner w-full fixed top-0 left-0 z-50 opacity-90 shadow-lg" />
        <main className="pt-2">{children}</main>
      </body>
    </html>
  );
}
