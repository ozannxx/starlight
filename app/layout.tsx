import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AmbientBackground from "@/components/AmbientBackground";
import AppShell from "@/components/AppShell";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/Toast";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Project Starlight",
  description: "Project Starlight — ton compagnon de scolarité : agenda, devoirs, focus, objectifs, candidatures.",
};

const boot = `try{document.documentElement.dataset.theme=localStorage.getItem("starlight-theme")||"solar";if(localStorage.getItem("starlight-calm")==="1")document.documentElement.dataset.calm="1"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={inter.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <ThemeProvider>
          <ToastProvider>
            <AmbientBackground />
            <div className="relative z-10">
              <AppShell>{children}</AppShell>
            </div>
            <PWARegister />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}