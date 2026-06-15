// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Berkas tidak ditemukan" }, { status: 400 });
    }

    // Ubah file menjadi Buffer array
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Proses upload stream ke Cloudinary
   const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "portfolio_attachments",
          resource_type: "auto" // <--- TAMBAHKAN BARIS INI KUNCINYA
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (uploadResult as any).secure_url });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return NextResponse.json({ error: "Gagal mengunggah berkas ke server" }, { status: 500 });
  }
}