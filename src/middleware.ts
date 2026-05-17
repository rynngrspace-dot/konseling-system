import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteksi Akses: Jika Siswa mencoba masuk ke halaman BK
    if (path.startsWith("/dashboard/bk") && token?.role !== "GURU_BK") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Proteksi Akses: Jika Guru BK mencoba masuk ke halaman Siswa
    if (path.startsWith("/dashboard/siswa") && token?.role !== "SISWA") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
