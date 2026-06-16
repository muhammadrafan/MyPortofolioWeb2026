// app/actions/section.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. READ: Mengambil Seluruh Hirarki Data
// ==========================================
export async function getCompleteSections() {
  return await prisma.section.findMany({
    orderBy: { order: 'asc' }, // Urutkan sesuai prioritas
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          subItems: {
            orderBy: { order: 'asc' },
            include: {
              attachments: true, // Ambil juga lampirannya
            },
          },
        },
      },
    },
  });
}

// ==========================================
// 2. CREATE: Fungsi Tambah Data Dasar
// ==========================================
export async function createSection(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.section.create({ data: { name } });
  revalidatePath("/admin");
}

export async function createSectionItem(formData: FormData) {
  const sectionId = parseInt(formData.get("sectionId") as string);
  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string | null;

  await prisma.sectionItem.create({
    data: {
      sectionId,
      title,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath(`/admin/sections/${sectionId}`);
}

// ==========================================
// 3. DELETE: Fungsi Hapus (Cascade aman)
// ==========================================
export async function deleteSection(id: number) {
  // Karena kita pakai onDelete: Cascade di schema, 
  // menghapus Section akan otomatis menghapus semua item & sub-item di bawahnya!
  await prisma.section.delete({ where: { id } });
  revalidatePath("/admin");
}

// ==========================================
// 4. UPDATE: Fungsi Edit Data (Section & Item) - Sub-item cukup edit langsung di form tanpa fungsi terpisah
// ==========================================
export async function updateSectionItem(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string | null;

  const item = await prisma.sectionItem.update({
    where: { id },
    data: {
      title,
      // Kalau imageUrl kosong string, tetap pakai yang lama (dikirim dari client)
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath(`/admin/sections/${item.sectionId}`);
}

export async function deleteSectionItem(id: number) {
  const item = await prisma.sectionItem.findUnique({ where: { id } });

  await prisma.sectionItem.delete({ where: { id } });

  revalidatePath(`/admin/sections/${item?.sectionId}`);
}

// ==========================================
// 5. SUB-ITEM: Detail Peran & Kegiatan
// ==========================================
export async function createSectionSubItem(formData: FormData) {
  const sectionItemId = parseInt(formData.get("sectionItemId") as string);
  const subtitle = formData.get("subtitle") as string;
  const timeline = formData.get("timeline") as string;
  const content = formData.get("content") as string;

  if (!sectionItemId || !subtitle || !content) return;

  await prisma.sectionSubItem.create({
    data: {
      sectionItemId,
      subtitle,
      timeline,
      content,
    },
  });
  
  revalidatePath("/admin");
}

export async function deleteSectionSubItem(id: number) {
  await prisma.sectionSubItem.delete({ where: { id } });
  revalidatePath("/admin");
}

// Di dalam app/actions/section.ts

export async function updateSectionSubItem(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const subtitle = formData.get("subtitle") as string;
  const timeline = formData.get("timeline") as string;
  const content = formData.get("content") as string;

  if (!id || !subtitle || !content) return;

  await prisma.sectionSubItem.update({
    where: { id },
    data: { subtitle, timeline, content },
  });
  
  revalidatePath("/admin");
}

// ==========================================
// 6. ATTACHMENT: Lampiran Media / Dokumen
// ==========================================
export async function createAttachment(formData: FormData) {
  const sectionSubItemId = parseInt(formData.get("sectionSubItemId") as string);
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const type = formData.get("type") as "IMAGE" | "DOCUMENT";

  if (!sectionSubItemId || !url) return;

  await prisma.attachment.create({
    data: { sectionSubItemId, title, url, type },
  });
  
  revalidatePath("/admin");
}

export async function deleteAttachment(id: number) {
  await prisma.attachment.delete({ where: { id } });
  revalidatePath("/admin");
}