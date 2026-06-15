// app/admin/items/[itemId]/AttachmentModal.tsx
"use client";

import { useRef, useState } from "react";
import { createAttachment, deleteAttachment } from "@/app/actions/sections";

export default function AttachmentModal({ subItem, onClose }: { subItem: any; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // ==========================================
  // STATE UNTUK LIGHTBOX (POP-UP PREVIEW)
  // ==========================================
  const [viewingAtt, setViewingAtt] = useState<any>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number | null>(null);

  const openLightbox = (att: any) => {
    setViewingAtt(att);
    setPdfPage(1);
    setMaxPage(null);
  };

  const handleNextPage = () => {
    if (maxPage && pdfPage >= maxPage) return;
    setPdfPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    setPdfPage((p) => Math.max(1, p - 1));
  };

  // ==========================================
  // HANDLER UPLOAD
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return alert("Silakan pilih file terlebih dahulu!");

    const formElement = e.currentTarget as HTMLFormElement;
    const titleValue = (formElement.elements.namedItem("titleInput") as HTMLInputElement).value;
    const typeValue = (formElement.elements.namedItem("typeInput") as HTMLSelectElement).value;

    setIsSaving(true);

    try {
      const uploaderFormData = new FormData();
      uploaderFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploaderFormData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.error);

      const actionFormData = new FormData();
      actionFormData.append("sectionSubItemId", subItem.id.toString());
      actionFormData.append("title", titleValue);
      actionFormData.append("type", typeValue);
      actionFormData.append("url", uploadData.url);

      await createAttachment(actionFormData);

      setSelectedFile(null);
      setPreviewUrl("");
      formRef.current?.reset();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mengunggah.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ========================================== */}
      {/* 1. MODAL UTAMA KELOLA LAMPIRAN */}
      {/* ========================================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div>
              <h2 className="text-xl font-bold text-white">Kelola Lampiran & Berkas</h2>
              <p className="text-sm text-slate-400 mt-1">Peran: {subItem.subtitle}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors">✕</button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            <form ref={formRef} onSubmit={handleSubmit} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nama / Judul Lampiran</label>
                  <input type="text" name="titleInput" required placeholder="Contoh: Arsitektur Data Parser-X" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Kategori File</label>
                  <select name="typeInput" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 appearance-none">
                    <option value="IMAGE">Gambar / Tangkapan Layar (IMAGE)</option>
                    <option value="DOCUMENT">Dokumen / PDF / Spreadsheet (DOCUMENT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Pilih Berkas Pendukung</label>
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700 hover:file:cursor-pointer" />
                </div>

                {previewUrl && (
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-700 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 mb-1 font-mono">Preview Seleksi:</span>
                    {selectedFile?.type.startsWith("image/") ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-20 object-cover rounded border border-slate-700" />
                    ) : (
                      <div className="w-full h-20 bg-blue-500/10 rounded flex items-center justify-center text-blue-400 font-bold text-xs">📄 PDF / Doc</div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors w-full">
                {isSaving ? "Sedang Memproses & Mengunggah..." : "🚀 Mulai Upload & Simpan"}
              </button>
            </form>

            <div>
              <h3 className="text-md font-semibold text-white mb-4">Lampiran Ter-upload ({subItem.attachments?.length || 0})</h3>
              {subItem.attachments?.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Belum ada lampiran bukti untuk peran ini.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subItem.attachments?.map((att: any) => (
                    <div key={att.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between group relative hover:border-slate-700 transition-all">
                      
                      {/* PREVIEW KOTAK (THUMBNAIL) */}
                      <div className="mb-3 overflow-hidden rounded-lg bg-slate-900 border border-slate-800 h-32 flex items-center justify-center relative">
                        {att.type === "IMAGE" ? (
                          <img src={att.url} alt={att.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="relative w-full h-full bg-slate-800">
                            <img src={att.url.replace(/\.pdf$/i, ".jpg")} alt={att.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="bg-slate-950/80 text-blue-400 font-bold text-xs px-3 py-1.5 rounded border border-slate-700 backdrop-blur-md">
                                📄 PDF
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-start gap-2">
                        <div className="overflow-hidden flex flex-col items-start">
                          <p className="text-sm font-semibold text-white truncate w-full" title={att.title}>{att.title}</p>
                          
                          {/* TOMBOL LIHAT DOKUMEN (MEMBUKA LIGHTBOX) */}
                          <button 
                            type="button"
                            onClick={() => openLightbox(att)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline mt-1 bg-emerald-500/10 px-2 py-1 rounded transition-colors"
                          >
                            👁️ Lihat Detail
                          </button>
                        </div>
                        
                        <form action={async () => {
                          if (confirm(`Hapus lampiran "${att.title}" dari database?`)) await deleteAttachment(att.id);
                        }}>
                          <button type="submit" className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-all">
                            🗑️
                          </button>
                        </form>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. MODAL LIGHTBOX (POP-UP PREVIEW GAMBAR/PDF) */}
      {/* ========================================== */}
      {viewingAtt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Tombol Tutup */}
          <button onClick={() => setViewingAtt(null)} className="absolute top-6 right-8 text-slate-400 hover:text-white text-4xl leading-none transition-colors">
            &times;
          </button>

          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center p-4">
            
            {/* Header Lightbox */}
            <div className="absolute top-6 left-8 text-white">
              <h3 className="font-bold text-xl">{viewingAtt.title}</h3>
              {viewingAtt.type === "DOCUMENT" && (
                <p className="text-sm text-slate-400 mt-1 bg-slate-800 inline-block px-3 py-1 rounded-full border border-slate-700">
                  Halaman {pdfPage} {maxPage ? `/ ${maxPage}` : ''}
                </p>
              )}
            </div>

            {/* Area Gambar / PDF Render */}
            <div className="flex items-center gap-6 w-full h-full justify-center mt-10">
              
              {/* Panah Kiri (Hanya jika PDF) */}
              {viewingAtt.type === "DOCUMENT" && (
                <button onClick={handlePrevPage} disabled={pdfPage === 1} className="p-4 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 disabled:opacity-0 transition-opacity border border-slate-700">
                  &larr;
                </button>
              )}

              {/* Tampilan Utama */}
              <div className="relative h-full max-w-full flex items-center justify-center">
                <img 
                  src={
                    viewingAtt.type === "IMAGE" 
                      ? viewingAtt.url 
                      // Menggunakan pg_ untuk memanggil halaman PDF secara spesifik, lalu diubah jadi JPG
                      : viewingAtt.url.replace('/upload/', `/upload/pg_${pdfPage}/`).replace(/\.pdf$/i, '.jpg')
                  } 
                  alt={`Preview - Halaman ${pdfPage}`} 
                  className="max-h-full max-w-full object-contain rounded-md shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800"
                  onError={() => {
                    // Jika halaman ini tidak ada (gagal load), paksa mundur 1 halaman dan kunci tombol next
                    if (viewingAtt.type === "DOCUMENT") {
                      setMaxPage(pdfPage - 1);
                      setPdfPage(pdfPage - 1);
                    }
                  }}
                />
              </div>

              {/* Panah Kanan (Hanya jika PDF) */}
              {viewingAtt.type === "DOCUMENT" && (
                <button onClick={handleNextPage} disabled={maxPage !== null && pdfPage >= maxPage} className="p-4 bg-slate-800/80 text-white rounded-full hover:bg-slate-700 disabled:opacity-0 transition-opacity border border-slate-700">
                  &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}