import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/Providers";
import { LangProvider } from "@/context/LangContext";
import { parseLangCookie } from "@/lib/lang";
import { cookies } from "next/headers";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "National Health Career Academy",
  description: "NHA-aligned certification prep for healthcare careers",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = parseLangCookie(cookieStore.get('lang')?.value ?? null);

  return (
    <html lang={lang} className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          <LangProvider initialLang={lang}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-900 text-gray-400 text-center text-sm py-4">
              &copy; {new Date().getFullYear()} National Health Career Academy
            </footer>
          </LangProvider>
        </Providers>
      </body>
    </html>
  );
}
