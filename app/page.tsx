// app/page.tsx
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import HeroSection from '@/components/HeroSection';
import DynamicSection from '@/components/DynamicSection';

export default async function PortfolioHome() {
  const profile = await prisma.profile.findFirst();

  const customSections = await prisma.section.findMany({
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          subItems: {
            orderBy: { order: 'asc' },
            include: { attachments: true },
          },
        },
      },
    },
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-xl animate-pulse">
          &gt; System Error: 404_ Profile Data Not Found.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <HeroSection profile={profile} />
      <div className="relative z-20 bg-slate-950">
        {customSections.map((section, index) => (
          <DynamicSection key={section.id} section={section} index={index} />
        ))}
      </div>
    </main>
  );
}