// app/admin/sections/SectionManager.tsx
"use client";

import { useRef } from "react";
import { createSection, deleteSection } from "@/app/actions/sections";
import Link from "next/link";
// Tipe data sederhana untuk props
type SectionProps = {
  id: number;
  name: string;
  items: any[];
};

export default function SectionManager({ initialSections }: { initialSections: SectionProps[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  // Fungsi untuk handle submit agar input teks otomatis kosong setelah disave
  const handleAddSection = async (formData: FormData) => {
    await createSection(formData);
    formRef.current?.reset(); // Kosongkan input setelah berhasil
  };

  return (
    <div className="space-y-8">
      
      {/* FORM TAMBAH KATEGORI (SECTION) BARU */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Tambah Kategori Baru</h2>
        <form ref={formRef} action={handleAddSection} className="flex gap-4">
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Pengalaman Profesional, Sertifikasi..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            + Tambah
          </button>
        </form>
      </div>

      {/* DAFTAR KATEGORI YANG SUDAH ADA */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Daftar Kategori</h2>
        
        {initialSections.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-500">Belum ada kategori yang ditambahkan.</p>
          </div>
        ) : (
          initialSections.map((section) => (
            <div 
              key={section.id} 
              className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between group transition-colors hover:border-slate-700"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{section.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Mempunyai {section.items.length} entri institusi/proyek
                </p>
              </div>

              <div className="flex gap-3">
                {/* Tombol Kelola Isi (Nanti akan diarahkan ke halaman detail) */}
                <Link href={`/admin/sections/${section.id}`}>
                  <button className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors">
                    Kelola Isi
                  </button>
                </Link>

                {/* Tombol Hapus Section */}
                <form action={async () => {
                  if (confirm(`Yakin ingin menghapus kategori "${section.name}"? Semua data di dalamnya akan ikut terhapus.`)) {
                    await deleteSection(section.id);
                  }
                }}>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}