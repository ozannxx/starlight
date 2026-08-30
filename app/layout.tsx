import type { Metadata } from "next";
import AmbientBackground from "@/components/AmbientBackground";
import AppShell from "@/components/AppShell";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Starlight",
  description: "Project Starlight — ton compagnon de scolarité : agenda, devoirs, focus, objectifs, candidatures.",
};

const themeInit = `try{document.documentElement.dataset.theme=localStorage.getItem("starlight-theme")||"solar"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <AmbientBackground />
          <div className="relative z-10">
            <AppShell>{children}</AppShell>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}