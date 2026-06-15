// app/admin/ProfileForm.tsx
"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

export default function ProfileForm({ profile }: { profile: any }) {
  // State untuk menyimpan pesan error
  const [fileError, setFileError] = useState("");

  // Fungsi pengecekan saat file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // 1 MB = 1.048.576 bytes
    if (file && file.size > 1048576) {
      setFileError("Ukuran file terlalu besar! Maksimal 1 MB.");
      e.target.value = ""; // Langsung hapus file yang kadung dipilih
    } else {
      setFileError(""); // Bersihkan pesan error jika file aman
    }
  };

  return (
    <form action={updateProfile} suppressHydrationWarning className="space-y-6 bg-slate-900 p-8 rounded-xl border border-slate-800">
      {/* --- Bagian Foto Profil --- */}
      <div className="mb-6 pb-6 border-b border-slate-800">
        <label className="block text-sm font-medium text-slate-400 mb-2">Foto Profil (Maks. 1 MB)</label>
        <div className="flex items-center gap-6">
          {profile?.profilePicture && (
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
            />
          )}
          <div className="flex-1">
            <input 
              type="file" 
              name="profilePicture" 
              accept="image/*"
              onChange={handleFileChange}
              suppressHydrationWarning
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-slate-800 file:text-blue-400
                hover:file:bg-slate-700 hover:file:cursor-pointer"
            />
            {/* Teks Error Merah Muncul Di Sini */}
            {fileError && (
              <p className="text-red-400 text-sm mt-2 font-medium animate-pulse">{fileError}</p>
            )}
          </div>
        </div>
      </div>

      {/* --- Bagian Input Teks Lainnya --- */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Nama Lengkap</label>
          <input 
            type="text" 
            name="name" 
            defaultValue={profile?.name || ""} 
            required 
            suppressHydrationWarning
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Tagline Profesi</label>
          <input 
            type="text" 
            name="tagline" 
            defaultValue={profile?.tagline || ""} 
            required 
            suppressHydrationWarning
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Ringkasan / Summary</label>
        <textarea 
          name="summary" 
          defaultValue={profile?.summary || ""} 
          rows={5} 
          required 
          suppressHydrationWarning
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">URL LinkedIn</label>
          <input 
            type="url" 
            name="linkedinUrl" 
            defaultValue={profile?.linkedinUrl || ""} 
            suppressHydrationWarning
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">URL GitHub</label>
          <input 
            type="url" 
            name="githubUrl" 
            defaultValue={profile?.githubUrl || ""} 
            suppressHydrationWarning
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Tech Stack (Pemisah koma)</label>
        <input 
            type="text" 
            name="techStack" 
            defaultValue={profile?.techStack || ""}
            suppressHydrationWarning
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Python, SQL, Power BI, LLMs"
        />
        <p className="text-xs text-slate-500 mt-1">Contoh: Python, SQL, Power BI, LLMs</p>
      </div>

      {/* Tombol dimatikan (disabled) jika ada error ukuran file */}
      <button 
        type="submit" 
        disabled={!!fileError}
        suppressHydrationWarning
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-lg transition-colors mt-4"
      >
        Simpan Perubahan
      </button>
    </form>
  );
}