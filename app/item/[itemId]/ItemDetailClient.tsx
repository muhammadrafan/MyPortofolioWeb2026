// app/item/[itemId]/ItemDetailClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface Attachment {
  id: number;
  title: string;
  url: string;
  type: 'IMAGE' | 'DOCUMENT';
}

interface SubItem {
  id: number;
  subtitle: string;
  timeline: string;
  content: string;
  attachments: Attachment[];
}

interface Item {
  id: number;
  title: string;
  imageUrl?: string | null;
  section: { id: number; name: string };
  subItems: SubItem[];
}

// ==========================================
// HELPER: SORTING BERDASARKAN TIMELINE
// ==========================================
const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  mei: 4, agu: 7, des: 11,
};

function getTimelineEndValue(timeline?: string): number {
  if (!timeline) return -Infinity;
  const parts = timeline.split(/[-–—]/).map((p) => p.trim());
  const endPart = parts[parts.length - 1] || '';
  if (/present|sekarang|now|current|ongoing/i.test(endPart)) return Infinity;
  const monthYear = endPart.match(/([A-Za-z]{3,})\s+(\d{4})/);
  if (monthYear) {
    const monthKey = monthYear[1].slice(0, 3).toLowerCase();
    const month = MONTH_MAP[monthKey] ?? 0;
    const year = parseInt(monthYear[2], 10);
    return year * 12 + month;
  }
  const yearOnly = endPart.match(/(\d{4})/);
  if (yearOnly) return parseInt(yearOnly[1], 10) * 12;
  return -Infinity;
}

function sortByTimelineDesc(arr: SubItem[] = []): SubItem[] {
  return [...arr].sort(
    (a, b) => getTimelineEndValue(b?.timeline) - getTimelineEndValue(a?.timeline)
  );
}

// ==========================================
// KOMPONEN VISUAL
// ==========================================
function InstitutionFloatingImage({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  if (!imageUrl) return null;

  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 hidden sm:block">
      <div className="rounded-md bg-white/95 p-1.5 shadow-lg shadow-black/30 ring-1 ring-slate-700/50">
        <img
          src={imageUrl}
          alt={`Logo ${title}`}
          className="max-h-10 max-w-[90px] object-contain"
        />
      </div>
    </div>
  );
}

function InstitutionBackground({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  if (!imageUrl) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {/* Gambar 1: drift dari kiri ke kanan */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute -left-8 top-1/2 -translate-y-1/2 h-36 w-auto object-contain
                   opacity-[0.04] grayscale invert
                   animate-drift-ltr"
      />
      {/* Gambar 2: drift dari kanan ke kiri, delay biar tidak sinkron */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute -right-8 bottom-1/4 h-28 w-auto object-contain
                   opacity-[0.04] grayscale invert
                   animate-drift-rtl [animation-delay:4s]"
      />
    </div>
  );
}

function AttachmentThumbnail({ attachment, onClick }: { attachment: Attachment; onClick: () => void }) {
  const imgUrl = attachment.type === 'IMAGE' ? attachment.url : attachment.url.replace(/\.pdf$/i, '.jpg');
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_8px_24px_rgba(59,130,246,0.18)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
    >
      <img src={imgUrl} alt={attachment.title} className="h-full w-full object-cover opacity-75 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" onError={(e) => (e.currentTarget.style.display = 'none')} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent p-2">
        <p className="truncate font-mono text-[10px] text-slate-200">{attachment.title}</p>
      </div>
      {attachment.type === 'DOCUMENT' ? (
        <span className="absolute left-1.5 top-1.5 rounded border border-emerald-500/30 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-400">PDF</span>
      ) : (
        <span className="absolute left-1.5 top-1.5 rounded border border-blue-500/30 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[8px] font-bold text-blue-400">IMG</span>
      )}
    </button>
  );
}

// ==========================================
// KOMPONEN UTAMA (CLIENT)
// ==========================================
export default function ItemDetailClient({ item }: { item: Item }) {
  const [viewingAtt, setViewingAtt] = useState<Attachment | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number | null>(null);

  const openLightbox = (att: Attachment) => {
    setViewingAtt(att);
    setPdfPage(1);
    setMaxPage(null);
  };

  const handleNextPage = () => {
    if (maxPage && pdfPage >= maxPage) return;
    setPdfPage((p) => p + 1);
  };

  const handlePrevPage = () => setPdfPage((p) => Math.max(1, p - 1));

  const richTextClass = "text-slate-400 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mt-1 [&_a]:text-emerald-400 [&_a]:hover:text-emerald-300 [&_a]:underline";

  return (
    <div className="mx-auto max-w-4xl px-6 relative z-10">
      
      {/* Tombol Back */}
      <Link 
        href={`/#section-${item.section.id}`}
        className="inline-flex items-center gap-2 mb-8 text-sm font-mono text-slate-500 hover:text-emerald-400 transition-colors group"
      >
        <span className="transition-transform group-hover:-translate-x-1">&larr;</span> 
        cd ../{String(item.section.name).toLowerCase().replace(/\s+/g, '-')}
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
        <InstitutionBackground imageUrl={item.imageUrl} title={item.title} />
        
        {/* Title bar */}
        <div className="relative flex items-center gap-2 border-b border-slate-800/60 bg-slate-950/40 px-5 py-4">
          <span className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="h-3 w-3 rounded-full bg-amber-500/60" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
          <span className="ml-2 truncate font-mono text-sm text-slate-300 max-w-[70%]">
            ~/{String(item.section.name).toLowerCase().replace(/\s+/g, '-')}/{item.title}
          </span>
          <InstitutionFloatingImage imageUrl={item.imageUrl} title={item.title} />
        </div>

        {/* Konten SubItems */}
        <div className="space-y-12 p-6 md:p-10">
          
<h1 className="relative z-10 text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent mb-14">
  {item.title}
</h1>

          {sortByTimelineDesc(item.subItems).map((sub, si, arr) => {
  const isLast = si === arr.length - 1;

  return (
    <div key={sub.id} className="relative z-10 flex gap-4">
      {/* Kolom kiri: dot + garis */}
      <div className="relative flex w-4 flex-shrink-0 flex-col items-center">
        <span
          className={`h-4 w-4 rounded-full border-[3px] border-slate-900 flex-shrink-0 ${
            si === 0 ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-600'
          }`}
        />
        {!isLast && (
          <span className="mt-1 w-px flex-1 bg-gradient-to-b from-emerald-500/40 via-slate-700/40 to-transparent" />
        )}
      </div>

      {/* Kolom kanan: konten */}
      <div className="flex-1 pb-2">
        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
          <h4 className="text-xl font-semibold text-slate-100 leading-tight">{sub.subtitle}</h4>
          <span className="font-mono text-sm text-emerald-400/80">{sub.timeline}</span>
        </div>

        <div className={`${richTextClass} mt-4 mb-6 max-w-none`} dangerouslySetInnerHTML={{ __html: sub.content }} />

        {sub.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <h5 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">Lampiran ({sub.attachments.length})</h5>
            <div className="flex flex-wrap items-center gap-4">
              {sub.attachments.map((att) => (
                <AttachmentThumbnail key={att.id} attachment={att} onClick={() => openLightbox(att)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
})}
        </div>
      </div>

      {/* ==========================================
          MODAL LIGHTBOX
      ========================================== */}
      {viewingAtt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setViewingAtt(null); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setViewingAtt(null); }}
          tabIndex={-1}
          autoFocus
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(79,79,79,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(79,79,79,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <button onClick={() => setViewingAtt(null)} className="absolute top-6 right-8 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/80 text-slate-400 text-2xl leading-none transition-all duration-300 hover:rotate-90 hover:border-red-500/40 hover:text-red-400">&times;</button>

          <div className="relative z-10 w-full max-w-5xl h-[85vh] flex flex-col items-center p-4 pt-24 md:pt-28 pointer-events-none">
            <div className="absolute top-6 left-8 text-white z-10 pointer-events-auto">
              <h3 className="font-mono text-xl"><span className="text-emerald-400">&gt;_</span> {viewingAtt.title}</h3>
              {viewingAtt.type === 'DOCUMENT' && (
                <div className="mt-3 flex items-center gap-3">
                  <p className="font-mono text-sm text-slate-400 bg-slate-900/80 inline-block px-3 py-1 rounded-full border border-slate-700/60">Halaman {pdfPage} {maxPage ? `/ ${maxPage}` : ''}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 w-full flex-1 justify-center pointer-events-auto">
              {viewingAtt.type === 'DOCUMENT' && (
                <button onClick={handlePrevPage} disabled={pdfPage === 1} className="p-4 bg-slate-900/80 text-slate-300 rounded-full hover:bg-slate-800 hover:text-emerald-400 disabled:opacity-0 transition-all duration-300 border border-slate-700/60 hover:border-emerald-500/30">&larr;</button>
              )}
              <div className="relative h-full max-w-full flex items-center justify-center">
                <div className="pointer-events-none absolute -inset-2 rounded-xl bg-gradient-to-br from-blue-500/15 to-emerald-500/15 blur-2xl" />
                <img
                  src={viewingAtt.type === 'IMAGE' ? viewingAtt.url : viewingAtt.url.replace('/upload/', `/upload/pg_${pdfPage}/`).replace(/\.pdf$/i, '.jpg')}
                  alt={`Preview - Halaman ${pdfPage}`}
                  className="relative max-h-[65vh] md:max-h-[70vh] max-w-full object-contain rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.55)] border border-slate-800"
                  onError={() => { if (viewingAtt.type === 'DOCUMENT') { setMaxPage(pdfPage - 1); setPdfPage(pdfPage - 1); } }}
                />
              </div>
              {viewingAtt.type === 'DOCUMENT' && (
                <button onClick={handleNextPage} disabled={maxPage !== null && pdfPage >= maxPage} className="p-4 bg-slate-900/80 text-slate-300 rounded-full hover:bg-slate-800 hover:text-emerald-400 disabled:opacity-0 transition-all duration-300 border border-slate-700/60 hover:border-emerald-500/30">&rarr;</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}