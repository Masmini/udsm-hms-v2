//src/middleware.ts
// This is the main Next.js middleware file that handles authentication and authorization.
// It uses `next-auth/middleware` to protect routes based on user session and roles.
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Handle /admin route - redirect to /admin/dashboard
    if (pathname === "/admin") {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Protect admin routes
    if (pathname.startsWith("/admin/") && pathname !== "/admin/dashboard") {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Protect user dashboard routes
    if (pathname.startsWith("/dashboard/")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      // Extract user ID from path
      const pathUserId = pathname.split("/")[2];
      if (pathUserId && pathUserId !== token.id && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Protect testing routes
    if (pathname.startsWith("/testing")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/auth/") ||
          pathname.startsWith("/hubs") ||
          pathname.startsWith("/events") ||
          pathname.startsWith("/projects") ||
          pathname.startsWith("/programmes") ||
          pathname.startsWith("/news") ||
          pathname.startsWith("/_next/") ||
          pathname.startsWith("/api/auth/") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
