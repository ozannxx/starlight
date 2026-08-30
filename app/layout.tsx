import type { Metadata } from "next";
import AmbientBackground from "@/components/AmbientBackground";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Starlight",
  description: "Project Starlight — espace élève : tableau de bord, agenda, devoirs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AmbientBackground />
        <div className="relative z-10">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}