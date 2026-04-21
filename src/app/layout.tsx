import type { Metadata } from "next";
import { Nunito, Architects_Daughter } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-nunito",
  display: 'swap',
});

const architects = Architects_Daughter({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-architects",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Red Rose Gaming 🌹",
  description: "A private family video-sharing website for Rose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${architects.variable}`}>
      <body className="font-nunito">{children}</body>
    </html>
  );
}
