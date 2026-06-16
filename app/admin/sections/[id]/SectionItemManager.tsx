"use client";

import { useRef, useState } from "react";
import { createSectionItem, deleteSectionItem, updateSectionItem } from "@/app/actions/sections";
import Link from "next/link";
import Image from "next/image";

type ItemProps = {
  id: number;
  title: string;
  imageUrl?: string | null;
};

// --- Upload helper ---
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload gagal");

  const data = await res.json();
  return data.url as string;
}

// --- Modal Edit ---
function EditModal({ item, onClose }: { item: ItemProps; onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(item.imageUrl ?? null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(item.imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tampilkan preview lokal dulu
    setPreview(URL.createObjectURL(file));

    // Upload ke Cloudinary
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
    } catch {
      alert("Gagal mengunggah foto. Silakan coba lagi.");
      setPreview(item.imageUrl ?? null);
      setUploadedUrl(item.imageUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    // Sisipkan URL hasil upload (bukan file)
    formData.set("imageUrl", uploadedUrl ?? "");
    await updateSectionItem(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-5">Edit Institusi</h2>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={item.id} />
          {/* imageUrl akan di-set manual via formData.set() di handleSubmit */}

          {/* Preview Foto */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center relative">
              {preview ? (
                <Image src={preview} alt="Preview" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-500 text-3xl">🏢</span>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs">...</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              {isUploading ? "Mengunggah..." : "Ganti Foto"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Nama Institusi */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nama Institusi</label>
            <input
              type="text"
              name="title"
              defaultValue={item.title}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Komponen Utama ---
export default function SectionItemManager({
  sectionId,
  items,
}: {
  sectionId: number;
  items: ItemProps[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemProps | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
    } catch {
      alert("Gagal mengunggah foto. Silakan coba lagi.");
      setImagePreview(null);
      setUploadedUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = async (formData: FormData) => {
    // Sisipkan URL hasil upload
    formData.set("imageUrl", uploadedUrl ?? "");
    await createSectionItem(formData);
    formRef.current?.reset();
    setImagePreview(null);
    setUploadedUrl(null);
  };

  return (
    <>
      {editingItem && (
        <EditModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}

      <div className="space-y-8">
        {/* FORM TAMBAH */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-4">Tambah Payung Utama / Institusi</h2>
          <form ref={formRef} action={handleAddItem} className="space-y-4">
            <input type="hidden" name="sectionId" value={sectionId} />

            {/* Upload foto */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-2xl">🏢</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs">↑</span>
                  </div>
                )}
              </div>
              <label className={`cursor-pointer flex flex-col gap-1 ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
                <span className="text-sm font-medium text-slate-300">
                  Foto Institusi <span className="text-slate-500">(opsional)</span>
                </span>
                <span className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  {isUploading ? "Mengunggah..." : uploadedUrl ? "✓ Foto siap · Klik untuk ganti" : "Klik untuk pilih foto"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Nama + Tombol */}
            <div className="flex gap-4">
              <input
                type="text"
                name="title"
                required
                placeholder="Contoh: Telkom University, Upwork, Ramir Consulting..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isUploading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              >
                + Tambah Institusi
              </button>
            </div>
          </form>
        </div>

        {/* DAFTAR ITEM */}
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
                {/* Kiri: Foto + Nama */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 text-xl">🏢</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>

                {/* Kanan: Tombol */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-4 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <Link href={`/admin/items/${item.id}`}>
                    <button className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors">
                      Detail Peran & Aktivitas
                    </button>
                  </Link>
                  <form
                    action={async () => {
                      if (confirm(`Yakin ingin menghapus "${item.title}" beserta semua aktivitas di dalamnya?`)) {
                        await deleteSectionItem(item.id);
                      }
                    }}
                  >
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
    </>
  );
}