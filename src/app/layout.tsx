import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "./context/GameContext";

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
    <html lang="en">
      <body className={`${inter.className} bg-gray-800 min-h-screen flex flex-col`}>
        <GameProvider>
          <div className="flex-grow">
            {children}
          </div>
          <footer className="py-4 text-center text-gray-400 text-sm">
            <p>
              Developed by <a href="https://alotfipoor.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 transition-colors">Ashkan</a> &copy; {new Date().getFullYear()}
            </p>
          </footer>
        </GameProvider>
      </body>
    </html>
  );
}
