import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Patelin", template: "%s · Patelin" },
  description:
    "Collectionne les communes de France : ouvre des boosters, complète tes sets et place les villages sur la carte.",
};

export const viewport: Viewport = {
  themeColor: "#2f6fed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {/* Bottom padding keeps content clear of the mobile tab bar. */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}
