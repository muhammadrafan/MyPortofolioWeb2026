// app/actions/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const techStack = formData.get("techStack") as string; // Tambahkan ini
  // Tangkap file gambar dari form
  const file = formData.get("profilePicture") as File | null;
  let profilePictureUrl: string | undefined = undefined;

  // Jika admin mengunggah file baru (ukuran lebih dari 0 byte)
  if (file && file.size > 0) {
    if (file.size > 1048576) {
      throw new Error("Gagal: Ukuran file melebihi batas maksimal 1MB.");
    }
    // Ubah format File menjadi Buffer (format yang bisa dikirim lewat internet)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Kirim buffer tersebut ke Cloudinary via stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "portofolio_rafan" }, // Nama folder di Cloudinary
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Ambil URL aman dari Cloudinary
    profilePictureUrl = uploadResult.secure_url;
  }

  // Siapkan objek data yang mau disimpan ke PostgreSQL
    const updateData: any = { name, tagline, summary, linkedinUrl, githubUrl, techStack };
  
  // Jika ada foto baru yang diunggah, tambahkan URL-nya ke dalam objek data
  if (profilePictureUrl) {
    updateData.profilePicture = profilePictureUrl;
  }

  const existingProfile = await prisma.profile.findFirst();

  if (existingProfile) {
    await prisma.profile.update({
      where: { id: existingProfile.id },
      data: updateData,
    });
  } else {
    await prisma.profile.create({
      data: updateData,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}