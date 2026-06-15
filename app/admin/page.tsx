// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfileAdminPage() {
  // Ambil data dari database
  const profile = await prisma.profile.findFirst();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-8">Pengaturan Profil Utama</h1>
      
      {/* Panggil form client component dan lempar datanya */}
      <ProfileForm profile={profile} />
    </div>
  );
}
