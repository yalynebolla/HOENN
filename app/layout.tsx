import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon Roguelike — Hoenn",
  description: "A Slay the Spire-inspired roguelike set in the Hoenn region. Build synergies, collect relics, defeat legendary Pokémon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
