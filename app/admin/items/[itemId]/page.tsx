// app/admin/items/[itemId]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubItemManager from "./SubItemManager";

export default async function SubItemPage({ params }: { params: Promise<{ itemId?: string, itemid?: string }> }) {
  const resolvedParams = await params;
  
  // Mengambil param entah foldernya bernama [itemId] atau [itemid]
  const idString = resolvedParams.itemId || resolvedParams.itemid;
  const itemId = parseInt(idString as string);

  // SAFETY CHECK: Jika itemId ternyata bukan angka (NaN), langsung kembalikan ke halaman sebelumnya
  if (isNaN(itemId)) {
    redirect("/admin/sections");
  }

  // Ambil data Institusi (SectionItem) beserta parent-nya (Section) dan anak-anaknya (SubItems)
  const item = await prisma.sectionItem.findUnique({
    where: { id: itemId },
    include: {
      section: true,
      subItems: {
        orderBy: { order: "asc" },
        include: {
          attachments: true, // <--- TAMBAHKAN BARIS INI
        }
      }
    }
  });

  if (!item) {
    redirect("/admin/sections");
  }

  return (
    <div className="max-w-4xl">
      {/* Header Navigasi */}
      <div className="mb-8">
        <Link href={`/admin/sections/${item.sectionId}`} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 mb-4 w-fit">
          &larr; Kembali ke {item.section.name}
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">
          Institusi/Proyek: <span className="text-blue-400">{item.title}</span>
        </h1>
        <p className="text-slate-400">Tambahkan jabatan, rentang waktu, dan deskripsi kegiatan Anda di sini.</p>
      </div>

      {/* Komponen Pengelola */}
      <SubItemManager itemId={item.id} subItems={item.subItems} />
    </div>
  );
}