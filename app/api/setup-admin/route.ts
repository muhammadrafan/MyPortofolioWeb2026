import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Pastikan email yang digunakan sesuai dengan konfigurasi keamanan Anda
    const targetEmail = "rafan007@gmail.com";
    
    // GANTI TEKS DI BAWAH INI DENGAN PASSWORD YANG ANDA INGINKAN
    const plainPassword = "Rafanaja05!"; 

    // 2. Cek apakah admin sudah terdaftar agar tidak terjadi duplikasi
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: targetEmail }
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        status: "Gagal", 
        message: "Akun admin sudah ada di database!" 
      }, { status: 400 });
    }

    // 3. Enkripsi (Hash) password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 4. Masukkan data ke PostgreSQL
    const newAdmin = await prisma.admin.create({
      data: {
        email: targetEmail,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ 
      status: "Sukses", 
      message: "Akun admin berhasil dibuat!", 
      email: newAdmin.email 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ 
      status: "Error", 
      message: "Terjadi kesalahan sistem", 
      error 
    }, { status: 500 });
  }
}