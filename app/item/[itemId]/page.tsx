// app/item/[itemId]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ItemDetailClient from './ItemDetailClient';

export default async function ItemDetailPage({ 
  params 
}: { 
  params: Promise<{ itemId: string }> 
}) {
  // Tunggu params (Next.js 15 App Router standard)
  const resolvedParams = await params;
  const itemId = parseInt(resolvedParams.itemId);

  if (isNaN(itemId)) return notFound();

  // Ambil data Item beserta relasinya (Section, SubItems, Attachments)
  const item = await prisma.sectionItem.findUnique({
    where: { id: itemId },
    include: {
      section: true, // Untuk breadcrumb / nama folder
      subItems: {
        include: {
          attachments: true, // Ambil SEMUA lampiran
        },
      },
    },
  });

  if (!item) return notFound();

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-100 font-sans selection:bg-emerald-500/30 pt-24 pb-20">
      {/* Oper data ke Client Component untuk dirender */}
      <ItemDetailClient item={item as any} />
    </main>
  );
}