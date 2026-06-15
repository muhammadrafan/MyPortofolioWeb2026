// app/admin/sections/page.tsx
import { getCompleteSections } from "@/app/actions/sections";
import SectionManager from "./SectionManager";

export default async function SectionsAdminPage() {
  // Ambil semua data beserta relasinya dari database
  const sections = await getCompleteSections();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kelola Portofolio</h1>
        <p className="text-slate-400">Atur kategori pengalaman, riwayat kerja, dan proyek Anda di sini.</p>
      </div>
      
      {/* Lempar data ke Client Component untuk interaktivitas UI */}
      <SectionManager initialSections={sections} />
    </div>
  );
}