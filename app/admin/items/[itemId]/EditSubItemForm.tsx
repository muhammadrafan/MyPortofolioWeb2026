// app/admin/items/[itemId]/EditSubItemForm.tsx
"use client";

import { useState } from "react";
import { updateSectionSubItem } from "@/app/actions/sections";
import RichTextEditor from "./RichTextEditor";

export default function EditSubItemForm({ sub, onCancel }: { sub: any, onCancel: () => void }) {
  // --- LOGIKA PARSING TANGGAL ("Jan 2026" -> "2026-01") ---
  const parseTimeline = (timeline: string | null) => {
    if (!timeline) return { start: "", end: "", present: false };
    const parts = timeline.split(" - ");
    const monthMap: Record<string, string> = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    
    const formatToInput = (str: string) => {
      if (!str || str === "Present") return "";
      const [m, y] = str.split(" ");
      return y && m ? `${y}-${monthMap[m] || "01"}` : "";
    };

    return {
      start: formatToInput(parts[0]),
      end: parts[1] === "Present" ? "" : formatToInput(parts[1]),
      present: parts[1] === "Present"
    };
  };

  const initialTimeline = parseTimeline(sub.timeline);

  // --- STATE FORM EDIT ---
  const [startDate, setStartDate] = useState(initialTimeline.start);
  const [endDate, setEndDate] = useState(initialTimeline.end);
  const [isPresent, setIsPresent] = useState(initialTimeline.present);
  const [content, setContent] = useState(sub.content || "");
  const [isSaving, setIsSaving] = useState(false);

  // --- LOGIKA GABUNG TANGGAL ---
  const formatMonthYear = (dateString: string) => {
    if (!dateString) return "";
    const [year, month] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const timelineString = formatMonthYear(startDate) 
    ? `${formatMonthYear(startDate)} - ${isPresent ? "Present" : formatMonthYear(endDate)}` 
    : "";

  const handleUpdate = async (formData: FormData) => {
    setIsSaving(true);
    await updateSectionSubItem(formData);
    setIsSaving(false);
    onCancel(); // Tutup form edit setelah selesai
  };

  return (
    <form action={handleUpdate} className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/30 space-y-4">
      <input type="hidden" name="id" value={sub.id} />
      <input type="hidden" name="timeline" value={timelineString} />
      <input type="hidden" name="content" value={content} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nama Jabatan/Peran</label>
          <input
            type="text"
            name="subtitle"
            defaultValue={sub.subtitle}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Rentang Waktu</label>
          <div className="flex items-center gap-2">
            <input type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:invert" />
            <span className="text-slate-500">-</span>
            <input type="month" value={endDate} disabled={isPresent} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-30 [&::-webkit-calendar-picker-indicator]:invert" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input type="checkbox" id={`present-${sub.id}`} checked={isPresent} onChange={(e) => setIsPresent(e.target.checked)} className="w-4 h-4 text-blue-500 rounded bg-slate-900 border-slate-700" />
            <label htmlFor={`present-${sub.id}`} className="text-sm text-slate-400">Present</label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Deskripsi / Pencapaian</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
        <button type="button" onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
          Batal
        </button>
      </div>
    </form>
  );
}