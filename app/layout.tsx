// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // <-- Tambahkan import Prisma
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
  // Ambil data section dari database, cukup ambil id dan name agar ringan
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
          
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-[#0a0f1a]/80 backdrop-blur-md transition-all">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              
              <Link href="/" className="font-mono text-lg font-bold text-white transition-colors hover:text-emerald-400">
                <span className="text-emerald-500">&gt;_</span> My Terminal
              </Link>

              {/* Menu Navigasi Desktop - Looping Dinamis */}
              <nav className="hidden items-center gap-8 md:flex">
                <Link 
                  href="/" 
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
                >
                  Home
                </Link>
                
                {sections.map((sec) => (
                  <Link 
                    key={sec.id}
                    href={`/#section-${sec.id}`} 
                    className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
                  >
                    {sec.name}
                  </Link>
                ))}
              </nav>

              {/* Tampilan Mobile Hamburger (Bisa dikembangkan nanti jika item terlalu banyak) */}
              <div className="flex md:hidden items-center gap-4">
                <span className="text-xs font-mono text-slate-500">Menu</span>
                {/* Anda bisa menambahkan icon hamburger menu di sini nanti */}
              </div>

            </div>
          </header>

          <div className="flex-1 pt-[73px] flex flex-col">
            {children}
          </div>

        </AuthProvider>
      </body>
    </html>
  );
}