// app/admin/items/[itemId]/SubItemManager.tsx
"use client";

import { useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor"; // Import komponen baru
import { createSectionSubItem, deleteSectionSubItem } from "@/app/actions/sections";
import EditSubItemForm from "./EditSubItemForm"; // <--- Import ini
import AttachmentModal from "./AttachmentModal";

type SubItemProps = {
  id: number;
  subtitle: string | null;
  timeline: string | null;
  content: string;
  attachments?: any[];
};

export default function SubItemManager({ itemId, subItems }: { itemId: number, subItems: SubItemProps[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState("");
  // State untuk kalender
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPresent, setIsPresent] = useState(false);
  // State baru untuk melacak item mana yang sedang diedit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [attachmentModalId, setAttachmentModalId] = useState<number | null>(null);
  // Fungsi pembantu untuk merombak "2026-01" menjadi "Jan 2026"
  const formatMonthYear = (dateString: string) => {
    if (!dateString) return "";
    const [year, month] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Gabungkan nilai menjadi satu string untuk dikirim ke database
  const formattedStart = formatMonthYear(startDate);
  const formattedEnd = isPresent ? "Present" : formatMonthYear(endDate);
  const timelineString = formattedStart ? `${formattedStart} - ${formattedEnd}` : "";

  const handleAddSubItem = async (formData: FormData) => {
    await createSectionSubItem(formData);
    formRef.current?.reset();
    
    // Reset kalender setelah berhasil submit
    setStartDate("");
    setEndDate("");
    setIsPresent(false);
    setContent("");
  };

  return (
    <div className="space-y-8">
      {/* FORM TAMBAH JABATAN / PERAN */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">Tambah Detail Peran</h2>
        <form ref={formRef} action={handleAddSubItem} className="space-y-4">
          <input type="hidden" name="sectionItemId" value={itemId} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Jabatan */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nama Jabatan/Peran</label>
              <input
                type="text"
                name="subtitle"
                required
                placeholder="Contoh: Data Analyst (Contract)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Input Rentang Waktu (Kalender Berbasis Bulan/Tahun) */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Rentang Waktu</label>
              
              {/* Ini adalah input rahasia yang dikirim ke database */}
              <input type="hidden" name="timeline" value={timelineString} />

              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
                <span className="text-slate-500 font-bold">-</span>
                <input
                  type="month"
                  value={endDate}
                  disabled={isPresent}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="presentCheck"
                  checked={isPresent}
                  onChange={(e) => setIsPresent(e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-slate-950 border-slate-700 rounded focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="presentCheck" className="text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Masih bekerja di sini (Present)
                </label>
              </div>
            </div>
          </div>

         <div>
          <label className="block text-sm text-slate-400 mb-2">Deskripsi Kegiatan / Pencapaian</label>
          
          {/* Input hidden ini bertugas mengirimkan teks HTML kaya fitur ke database */}
          <input type="hidden" name="content" value={content} />
          
          {/* Pemanggilan Rich Text Editor pengganti textarea */}
          <RichTextEditor 
            value={content} 
            onChange={setContent} 
          />
        </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Simpan Peran Ini
          </button>
        </form>
      </div>

      {/* DAFTAR PERAN YANG SUDAH ADA */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Riwayat Peran di Institusi Ini</h2>
        
        {subItems.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-500">Belum ada data peran yang ditambahkan.</p>
          </div>
        ) : (
          subItems.map((sub) => (
            // --- JIKA SEDANG DIEDIT, TAMPILKAN FORM EDIT ---
            editingId === sub.id ? (
              <EditSubItemForm 
                key={sub.id} 
                sub={sub} 
                onCancel={() => setEditingId(null)} 
              />
            ) : (
            // --- JIKA TIDAK DIEDIT, TAMPILKAN KARTU BIASA ---
              <div 
              key={sub.id} 
              className="bg-slate-900 p-6 rounded-xl border border-slate-800 transition-colors hover:border-slate-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{sub.subtitle}</h3>
                  <p className="text-sm text-emerald-400 font-mono mt-1">{sub.timeline}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingId(sub.id)} 
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <form action={async () => {
                      if (confirm(`Hapus peran "${sub.subtitle}"?`)) {
                        await deleteSectionSubItem(sub.id);
                      }
                    }}>
                    <button type="submit" className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-sm transition-colors">
                      Hapus
                    </button>
                  </form>
                  <button 
                    onClick={() => setAttachmentModalId(sub.id)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-sm transition-colors"
                  >
                    + Lampiran ({sub.attachments?.length || 0})
                  </button>
                </div>
              </div>
              
              {/* Tampilkan HTML Rich Text dengan benar */}
              <div 
                className="text-slate-400 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mt-1 [&_a]:text-blue-400 [&_a]:hover:text-blue-300 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sub.content }}
              />

              {/* ========================================== */}
              {/* TAMPILAN PREVIEW MINI LAMPIRAN (GALERI) */}
              {/* ========================================== */}
              {sub.attachments && sub.attachments.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Lampiran Pendukung</h4>
                  <div className="flex flex-wrap gap-3">
                    {sub.attachments.map((att: any) => (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setAttachmentModalId(sub.id)}
                        className="group relative w-24 h-24 rounded-lg border border-slate-700 bg-slate-950 overflow-hidden hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex-shrink-0 cursor-pointer"
                        title={`Kelola: ${att.title}`}
                      >
                        {/* Render Thumbnail */}
                        {att.type === "IMAGE" ? (
                          <img src={att.url} alt={att.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                        ) : (
                          <div className="relative w-full h-full">
                            {/* Trik Cloudinary JPG Thumbnail untuk PDF */}
                            <img src={att.url.replace(/\.pdf$/i, ".jpg")} alt={att.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="bg-slate-900/90 text-blue-400 font-bold text-[10px] px-2 py-1 rounded shadow">PDF</span>
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay Title */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-6 pb-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end h-full text-left">
                          <span className="text-[10px] leading-tight font-medium text-white truncate w-full drop-shadow-md">
                            {att.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Akhir Preview Lampiran */}

            </div>
            )
          ))
        )}

                {/* MODAL LAMPIRAN */}
        {attachmentModalId && (
          <AttachmentModal 
            subItem={subItems.find(s => s.id === attachmentModalId)} 
            onClose={() => setAttachmentModalId(null)} 
          />
        )}
      </div>
    </div>
  );
}