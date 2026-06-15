import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Mendeklarasikan variabel global untuk mode Development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
}

// 1. Ambil URL dari environment
const connectionString = process.env.DATABASE_URL;

// 2. Buat koneksi pool native PostgreSQL
const pool = new Pool({ connectionString });

// 3. Masukkan pool ke dalam Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Inisialisasi Prisma Client dengan adapter tersebut
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;