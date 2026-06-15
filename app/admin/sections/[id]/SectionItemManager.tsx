// app/admin/sections/[id]/SectionItemManager.tsx
"use client";

import { useRef } from "react";
import { createSectionItem, deleteSectionItem } from "@/app/actions/sections";
import Link from "next/link";
type ItemProps = {
  id: number;
  title: string;
};

export default function SectionItemManager({ sectionId, items }: { sectionId: number, items: ItemProps[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAddItem = async (formData: FormData) => {
    await createSectionItem(formData);
    formRef.current?.reset();
  };

  return (
    <div className="space-y-8">
      {/* FORM TAMBAH ITEM BARU */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Tambah Payung Utama / Institusi</h2>
        <form ref={formRef} action={handleAddItem} className="flex gap-4">
          <input type="hidden" name="sectionId" value={sectionId} />
          <input
            type="text"
            name="title"
            required
            placeholder="Contoh: Telkom University, Upwork, Ramir Consulting..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            + Tambah Institusi
          </button>
        </form>
      </div>

      {/* DAFTAR ITEM YANG SUDAH ADA */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Daftar Institusi / Proyek Utama</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-500">Belum ada institusi yang ditambahkan.</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center justify-between group transition-colors hover:border-slate-700"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
              </div>

              <div className="flex gap-3">
                    {/* Tombol Detail Peran (Kembali menggunakan pola yang terbukti berhasil) */}
                    <Link href={`/admin/items/${item.id}`}>
                        <button className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors">
                        Detail Peran & Aktivitas
                        </button>
                    </Link>

                    {/* Tombol Hapus */}
                    <form action={async () => {
                        if (confirm(`Yakin ingin menghapus "${item.title}" beserta semua aktivitas di dalamnya?`)) {
                        await deleteSectionItem(item.id);
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