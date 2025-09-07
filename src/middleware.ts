// File: middleware.ts

import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("session_token");
    const refreshToken = request.cookies.get("refresh_token");
    const pathname = request.nextUrl.pathname;

    // Create response with security headers
    const response = NextResponse.next();

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if accessing a protected route without authentication
    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login page
    if (pathname.startsWith("/login") && token) {
        const returnTo = request.nextUrl.searchParams.get("returnTo");
        const redirectUrl = new URL(returnTo || "/dashboard", request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // For API routes, add additional headers
    if (pathname.startsWith("/api/")) {
        response.headers.set("Cache-Control", "no-store");

        // Check authentication for protected API routes
        const protectedApiRoutes = ["/api/me", "/api/auth/logout"];
        const isProtectedApiRoute = protectedApiRoutes.some((route) =>
            pathname.startsWith(route)
        );

        if (isProtectedApiRoute && !token) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/api/me/:path*",
        "/api/auth/logout",
    ],
};
