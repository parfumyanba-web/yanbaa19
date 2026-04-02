import type { Metadata } from "next";
import { Outfit, Alexandria } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Yanba B2B | Parfumerie de Luxe',
  description: 'Digital B2B Platform for Yanba Perfumes Algeria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${alexandria.variable} ${outfit.variable}`}>
      <body className="bg-[#121212] overflow-x-hidden selection:bg-gold selection:text-black">
        <LanguageProvider>
          <ToastProvider>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
