// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar"; // <-- Import Navbar baru

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rafan Pradipta | Data Professional Portfolio",
  description: "Personal portfolio showcasing projects and experience.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil data dari database seperti biasa
  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0f1a] text-slate-100">
        <AuthProvider>
          
          {/* Gunakan Client Component Navbar dan oper datanya */}
          <Navbar sections={sections} />

          <div className="flex-1 pt-[73px] flex flex-col">
            {children}
          </div>

        </AuthProvider>
      </body>
    </html>
  );
}