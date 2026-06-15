// components/DynamicSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ==========================================
// HELPER: SORTING BERDASARKAN TIMELINE
// Tujuan: Pengalaman yang masih berjalan ("Present")
// selalu tampil paling atas, diikuti pengalaman
// sebelumnya diurutkan dari yang paling baru (descending).
// ==========================================
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  // varian penulisan Indonesia
  mei: 4, agu: 7, des: 11,
};

function getTimelineEndValue(timeline?: string): number {
  if (!timeline) return -Infinity;

  // Ambil bagian akhir dari rentang waktu, mis. "Aug 2025 - Jan 2026" -> "Jan 2026"
  const parts = timeline.split(/[-–—]/).map((p) => p.trim());
  const endPart = parts[parts.length - 1] || '';

  // Masih berjalan -> nilai tertinggi agar selalu di urutan teratas
  if (/present|sekarang|now|current|ongoing/i.test(endPart)) {
    return Infinity;
  }

  // Format "MMM YYYY" (mis. "Jan 2026")
  const monthYear = endPart.match(/([A-Za-z]{3,})\s+(\d{4})/);
  if (monthYear) {
    const monthKey = monthYear[1].slice(0, 3).toLowerCase();
    const month = MONTH_MAP[monthKey] ?? 0;
    const year = parseInt(monthYear[2], 10);
    return year * 12 + month;
  }

  // Fallback: hanya tahun, mis. "2026"
  const yearOnly = endPart.match(/(\d{4})/);
  if (yearOnly) {
    return parseInt(yearOnly[1], 10) * 12;
  }

  return -Infinity;
}

// Urutkan array sub-item (atau item apa pun yang punya `timeline`) dari terbaru/ongoing ke terlama
function sortByTimelineDesc(arr: any[] = []): any[] {
  return [...arr].sort(
    (a, b) => getTimelineEndValue(b?.timeline) - getTimelineEndValue(a?.timeline)
  );
}

// Nilai "terbaru" sebuah item, diambil dari subItem dengan timeline paling baru/ongoing
function getItemLatestValue(item: any): number {
  if (!item?.subItems?.length) return -Infinity;
  return Math.max(...item.subItems.map((s: any) => getTimelineEndValue(s.timeline)));
}

// Helper hook untuk animasi saat di-scroll
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Komponen Pratinjau Lampiran — gaya "file tile" personal
function AttachmentThumbnail({ attachment, onClick }: { attachment: any; onClick: () => void }) {
  const imgUrl = attachment.type === 'IMAGE'
    ? attachment.url
    : attachment.url.replace(/\.pdf$/i, '.jpg');

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_8px_24px_rgba(59,130,246,0.18)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
    >
      <img
        src={imgUrl}
        alt={attachment.title}
        className="h-full w-full object-cover opacity-75 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent p-1.5">
        <p className="truncate font-mono text-[9px] text-slate-200">{attachment.title}</p>
      </div>
      {attachment.type === 'DOCUMENT' ? (
        <span className="absolute left-1.5 top-1.5 rounded border border-emerald-500/30 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-400">
          PDF
        </span>
      ) : (
        <span className="absolute left-1.5 top-1.5 rounded border border-blue-500/30 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-blue-400">
          IMG
        </span>
      )}
    </button>
  );
}

export default function DynamicSection({ section, index }: { section: any; index: number }) {
  const { ref, isVisible } = useScrollReveal();

  // ==========================================
  // STATE UNTUK LIGHTBOX (POP-UP)
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

  // Selang-seling posisi glow & dekorasi (bukan warna bg flat lagi)
  const isEven = index % 2 === 0;

  // Urutkan item (mis. per perusahaan) berdasarkan timeline terbaru/ongoing,
  // baru ambil 3 teratas untuk ditampilkan di section.
  const sortedItems = [...section.items].sort(
    (a: any, b: any) => getItemLatestValue(b) - getItemLatestValue(a)
  );
  const items = sortedItems.slice(0, 3);
  const itemCount = items.length;

  if (itemCount === 0) return null;

  const richTextClass =
    "text-slate-400 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mt-1 [&_a]:text-emerald-400 [&_a]:hover:text-emerald-300 [&_a]:underline";

  return (
    <>
   
      <section id={`section-${section.id}`} className="relative overflow-hidden bg-[#0a0f1a] py-24">
        {/* Grid background — selaras dengan Hero */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,79,79,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(79,79,79,0.06)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_40%,transparent_100%)]" />

        {/* Glow blob blue → emerald, bergeser sisi tiap section */}
        <div
          className={`pointer-events-none absolute h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/10 to-emerald-500/10 blur-[110px] ${
            isEven ? '-left-32 top-10' : '-right-32 bottom-10'
          }`}
        />

        {/* Garis pemisah halus antar section */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-800/60 to-transparent" />

        <div
          ref={ref}
          className={`relative z-10 mx-auto max-w-5xl px-6 transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
        >
          {/* Header section — gaya terminal/personal */}
          <div className="mb-14 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-slate-600">
              {String(index + 1).padStart(2, '0')} //
            </span>
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                {section.name}
              </span>
            </h2>
            <span className="inline-block h-5 w-0.5 animate-[blink_0.8s_step-end_infinite] bg-emerald-400/70 align-middle" />
            <div className="h-px flex-1 bg-gradient-to-r from-slate-700/60 via-slate-800/30 to-transparent" />
          </div>

          {/* KONDISI 1: JIKA JUMLAH ITEM HANYA 1 */}
          {itemCount === 1 && (
            <div className="flex flex-col gap-8">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                >
                  {/* title bar ala terminal window */}
                  <div className="flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/40 px-5 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                    <span className="ml-2 truncate font-mono text-xs text-slate-500">
                      ~/{String(section.name ?? 'item').toLowerCase().replace(/\s+/g, '-')}/{item.title}
                    </span>
                  </div>

                  <div className="space-y-8 p-6 md:p-8">
                    {sortByTimelineDesc(item.subItems).map((sub: any, si: number) => {
                      const attachmentsToDisplay = sub.attachments?.slice(0, 2) || [];
                      const hasMoreAttachments = (sub.attachments?.length || 0) > 2;
                      const isLast = si === item.subItems.length - 1;

                      return (
                        <div
                          key={sub.id}
                          className={`relative pl-7 transition-all duration-700 ${
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                          }`}
                          style={{ transitionDelay: `${si * 120}ms` }}
                        >
                          {/* garis timeline */}
                          {!isLast && (
                            <span className="absolute left-[5px] top-3 -bottom-8 w-px bg-gradient-to-b from-emerald-500/40 via-slate-700/40 to-transparent" />
                          )}
                          {/* dot — entri terbaru berdenyut */}
                          <span
                            className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
                              si === 0
                                ? 'animate-pulse bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                                : 'bg-slate-700 ring-2 ring-slate-800'
                            }`}
                          />

                          <div className="mb-1 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                            <h4 className="text-lg font-semibold text-slate-100">{sub.subtitle}</h4>
                            <span className="font-mono text-xs text-emerald-400/80">{sub.timeline}</span>
                          </div>

                          <div
                            className={`${richTextClass} mt-3 mb-6 max-w-none`}
                            dangerouslySetInnerHTML={{ __html: sub.content }}
                          />

                          {/* Lampiran (Maksimal 2) */}
                          {attachmentsToDisplay.length > 0 && (
                            <div className="mt-8 pt-4 flex flex-wrap items-center gap-3">
                              {attachmentsToDisplay.map((att: any) => (
                                <AttachmentThumbnail
                                  key={att.id}
                                  attachment={att}
                                  onClick={() => openLightbox(att)}
                                />
                              ))}

                              {hasMoreAttachments && (
                                <Link
                                  href={`/item/${item.id}`}
                                  className="flex h-20 w-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 font-mono text-xs text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:text-emerald-400"
                                >
                                  <span>+{sub.attachments.length - 2} Lainnya</span>
                                  <span className="mt-1">Lihat Detail &rarr;</span>
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* KONDISI 2 & 3: JIKA JUMLAH ITEM 2 ATAU 3 */}
          {itemCount > 1 && (
            <div className={`grid gap-6 ${itemCount === 2 ? 'md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {items.map((item: any, i: number) => {
                const sortedSubItems = sortByTimelineDesc(item.subItems);
                const newestSub = sortedSubItems[0];
                const firstAttachment = newestSub?.attachments?.[0];

                return (
                  <div
                    key={item.id}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm transition-all duration-700 hover:-translate-y-1.5 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {/* garis aksen gradasi atas, muncul saat hover */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-emerald-500/70 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* title bar ala terminal window */}
                    <div className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-3">
                      <span className="h-2 w-2 rounded-full bg-slate-700 transition-colors duration-300 group-hover:bg-red-500/60" />
                      <span className="h-2 w-2 rounded-full bg-slate-700 transition-colors duration-300 group-hover:bg-amber-500/60" />
                      <span className="h-2 w-2 rounded-full bg-slate-700 transition-colors duration-300 group-hover:bg-emerald-500/60" />
                      <span className="ml-2 truncate font-mono text-[11px] text-slate-500">{item.title}</span>
                    </div>

                    <div className="flex-1 p-5">
                      <h3 className="mb-4 text-xl font-bold line-clamp-2">
                        <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                          {item.title}
                        </span>
                      </h3>

                      {newestSub ? (
                        <div className="relative pl-4">
                          <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.55)]" />
                          <h4 className="text-sm font-semibold text-white">{newestSub.subtitle}</h4>
                          <span className="mb-2 block font-mono text-xs text-emerald-400">{newestSub.timeline}</span>

                          <div
                            className={`${richTextClass} line-clamp-3`}
                            dangerouslySetInnerHTML={{ __html: newestSub.content }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Belum ada detail kegiatan.</p>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-800/60 bg-slate-950/40 p-4">
                      <div>
                        {firstAttachment ? (
                          <div className="flex items-center gap-2">
                            <AttachmentThumbnail attachment={firstAttachment} onClick={() => openLightbox(firstAttachment)} />
                            {newestSub.attachments.length > 1 && (
                              <span className="font-mono text-xs text-slate-500">+{newestSub.attachments.length - 1}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">Tanpa Lampiran</span>
                        )}
                      </div>

                      <Link
                        href={`/item/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3 py-1.5 text-xs font-medium text-blue-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/15"
                      >
                        Detail Item &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {section.items.length > 3 && (
            <div className="mt-12 flex justify-center">
              <Link
                href={`/section/${section.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
              >
                Lihat Semua {section.items.length} {section.name}
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      
      {/* ========================================== */}
      {/* MODAL LIGHTBOX (GAMBAR / PDF)               */}
      {/* ========================================== */}
      {viewingAtt && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md"
          // UPDATE 1: Fungsi untuk menutup pop-up ketika area gelap diklik
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingAtt(null);
          }}
          // Menangkap tombol "Escape" pada keyboard
          onKeyDown={(e) => {
            if (e.key === 'Escape') setViewingAtt(null);
          }}
          tabIndex={-1} // Agar elemen ini bisa menangkap event onKeyDown
          autoFocus   // Otomatis fokus agar tombol Esc langsung berfungsi
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,79,79,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(79,79,79,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Tombol Tutup */}
          <button
            onClick={() => setViewingAtt(null)}
            className="absolute top-6 right-8 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-400 text-2xl leading-none transition-all duration-300 hover:rotate-90 hover:border-red-500/40 hover:text-red-400"
          >
            &times;
          </button>

          {/* UPDATE: tambahkan pt-24 agar gambar tidak collide dengan judul, 
            dan hapus justify-center supaya konten "menempel" di bawah header */}
        <div className="relative z-10 w-full max-w-5xl h-[85vh] flex flex-col items-center p-4 pt-24 md:pt-28 pointer-events-none">

        {/* Header Keterangan Modal */}
        <div className="absolute top-6 left-8 text-white z-10 pointer-events-auto">
            <h3 className="font-mono text-xl">
            <span className="text-emerald-400">&gt;_</span> {viewingAtt.title}
            </h3>
            {viewingAtt.type === "DOCUMENT" && (
            <div className="mt-3 flex items-center gap-3">
                <p className="font-mono text-sm text-slate-400 bg-slate-900/80 inline-block px-3 py-1 rounded-full border border-slate-700/60">
                Halaman {pdfPage} {maxPage ? `/ ${maxPage}` : ''}
                </p>
            </div>
            )}
        </div>

        {/* Area Penampil Berkas */}
        {/* UPDATE: flex-1 menggantikan h-full + mt-12, mengisi sisa ruang setelah pt-24 */}
        <div className="flex items-center gap-6 w-full flex-1 justify-center pointer-events-auto">

            {/* Panah Kiri (Jika PDF) */}
            {viewingAtt.type === "DOCUMENT" && (
            <button
                onClick={handlePrevPage}
                disabled={pdfPage === 1}
                className="p-4 bg-slate-900/80 text-slate-300 rounded-full hover:bg-slate-800 hover:text-emerald-400 disabled:opacity-0 transition-all duration-300 border border-slate-700/60 hover:border-emerald-500/30"
            >
                &larr;
            </button>
            )}

            {/* Tampilan Visual (Gambar / Konversi PDF) */}
            <div className="relative h-full max-w-full flex items-center justify-center">
            <div className="pointer-events-none absolute -inset-2 rounded-xl bg-gradient-to-br from-blue-500/15 to-emerald-500/15 blur-2xl" />
            <img
                src={
                viewingAtt.type === "IMAGE"
                    ? viewingAtt.url
                    : viewingAtt.url.replace('/upload/', `/upload/pg_${pdfPage}/`).replace(/\.pdf$/i, '.jpg')
                }
                alt={`Preview - Halaman ${pdfPage}`}
                // UPDATE: max-h dibatasi (bukan max-h-full) agar selalu ada jarak aman dari header & bawah
                className="relative max-h-[65vh] md:max-h-[70vh] max-w-full object-contain rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.55)] border border-slate-800"
                onError={() => {
                if (viewingAtt.type === "DOCUMENT") {
                    setMaxPage(pdfPage - 1);
                    setPdfPage(pdfPage - 1);
                }
                }}
            />
            </div>

            {/* Panah Kanan (Jika PDF) */}
            {viewingAtt.type === "DOCUMENT" && (
            <button
                onClick={handleNextPage}
                disabled={maxPage !== null && pdfPage >= maxPage}
                className="p-4 bg-slate-900/80 text-slate-300 rounded-full hover:bg-slate-800 hover:text-emerald-400 disabled:opacity-0 transition-all duration-300 border border-slate-700/60 hover:border-emerald-500/30"
            >
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