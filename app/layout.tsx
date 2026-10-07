import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Vazirmatn } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/components.css";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-archivo", display: "swap" });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn", display: "swap" });

export const metadata: Metadata = {
  title: "Gandom Runners — Run with direction",
  description:
    "Gandom Runners is a coach-led running community in Tehran — for people starting from zero, people who need a routine, and people who want a real group to keep going with.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${archivo.variable} ${vazirmatn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
