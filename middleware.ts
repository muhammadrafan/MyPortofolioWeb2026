// middleware.ts yang lebih aman
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token }) => !!token, // Cukup kembalikan true/false
  },
});

export const config = { matcher: ["/admin/:path*"] };