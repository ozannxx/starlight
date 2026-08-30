import type { Metadata } from "next";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Amber — Design System",
  description:
    "Ultra-Glassmorphism + Neumorphism — thème clair chaud (iOS 26 / macOS Tahoe).",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {/* 1. Fond ambiant : toujours en PREMIER enfant du <body> */}
        <AmbientBackground />

        {/* 2. Tout le contenu au-dessus du fond */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}