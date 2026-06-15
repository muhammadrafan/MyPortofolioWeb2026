// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Dashboard Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "rafan007@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Validasi input kosong
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Kunci Akses: Tolak semua email selain email utama Anda
        if (credentials.email !== "rafan007@gmail.com") {
          return null; 
        }

        // 3. Cari admin di database
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        });

        if (!admin) {
          return null;
        }

        // 4. Verifikasi password (mencocokkan input dengan hash di database)
        const isPasswordMatch = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordMatch) {
          return null;
        }

        // 5. Login berhasil, kembalikan data user
        return { id: admin.id.toString(), email: admin.email };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Sesi login bertahan 24 jam
  },
  pages: {
    signIn: '/login', // Nanti kita buat halaman UI login di rute ini
  },
});

export { handler as GET, handler as POST };