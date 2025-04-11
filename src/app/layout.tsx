import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "./context/GameContext";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import BackgroundEffects from "./components/BackgroundEffects";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mafia Game",
  description: "A web app for playing Mafia with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <GameProvider>
            <BackgroundEffects />
            <div className="flex-grow container mx-auto px-4 py-8 relative z-10">
              <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
              </div>
              <main className="mt-16">
                {children}
              </main>
            </div>
            <Analytics />
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
