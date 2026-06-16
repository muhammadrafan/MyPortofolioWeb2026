// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Section {
  id: number;
  name: string;
}

export default function Navbar({ sections }: { sections: Section[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-[#0a0f1a]/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link 
          href="/" 
          className="font-mono text-lg font-bold text-white transition-colors hover:text-emerald-400"
          onClick={() => setIsOpen(false)} // Tutup menu jika logo diklik
        >
          <span className="text-emerald-500">&gt;_</span> My Terminal
        </Link>

        {/* Menu Navigasi Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400">
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

        {/* Tombol Hamburger Mobile */}
        <button 
          className="flex md:hidden items-center gap-2 text-slate-400 hover:text-emerald-400 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xs font-mono">{isOpen ? 'Close' : 'Menu'}</span>
          {/* Ikon garis tiga / silang */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      </div>

      {/* Menu Dropdown Mobile */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800/60 bg-[#0a0f1a]/95 backdrop-blur-xl absolute w-full shadow-2xl">
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {sections.map((sec) => (
              <Link 
                key={sec.id}
                href={`/#section-${sec.id}`} 
                className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
                onClick={() => setIsOpen(false)} // Otomatis tutup menu saat link diklik
              >
                {sec.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}