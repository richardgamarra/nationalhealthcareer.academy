import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/Providers";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "National Health Career Academy",
  description: "Cybersecurity & Health IT courses with live classes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-gray-400 text-center text-sm py-4">
            &copy; {new Date().getFullYear()} National Health Career Academy
          </footer>
        </Providers>
      </body>
    </html>
  );
}
