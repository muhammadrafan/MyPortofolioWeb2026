// app/admin/sections/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import SectionItemManager from "./SectionItemManager";

export default async function SectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Di Next.js terbaru, params adalah Promise, jadi kita harus await
  const resolvedParams = await params;
  const sectionId = parseInt(resolvedParams.id);

  // Cari kategori ini dan ambil item di dalamnya
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      items: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, imageUrl: true },
      }
    }
  });

  if (!section) {
    redirect("/admin/sections");
  }

  return (
    <div className="max-w-4xl">
      {/* Header Navigasi */}
      <div className="mb-8">
        <Link href="/admin/sections" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 mb-4 w-fit">
          &larr; Kembali ke Daftar Kategori
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">
          Kategori: <span className="text-emerald-400">{section.name}</span>
        </h1>
        <p className="text-slate-400">Tambahkan institusi atau payung proyek di bawah kategori ini.</p>
      </div>

      {/* Lempar data ke Client Component */}
      <SectionItemManager sectionId={section.id} items={section.items} />
    </div>
  );
}