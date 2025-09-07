// File: app/api/auth/refresh/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // 1. Get refresh token from cookies
        const refreshTokenCookie = (await cookies()).get("refresh_token");

        if (!refreshTokenCookie) {
            return NextResponse.json(
                { message: "No refresh token available" },
                { status: 401 }
            );
        }

        const refreshToken = refreshTokenCookie.value;

        // 2. Send refresh request to external API
        const res = await fetch("https://dummyjson.com/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "NextJS-App/1.0",
            },
            body: JSON.stringify({
                refreshToken,
                expiresInMins: 30, // Request 30 minutes for new access token
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            // Clear both tokens if refresh fails
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: -1,
                path: "/",
            };

            const response = NextResponse.json(
                { message: "Session expired. Please login again." },
                { status: 401 }
            );

            response.cookies.set("session_token", "", cookieOptions);
            response.cookies.set("refresh_token", "", cookieOptions);

            return response;
        }

        // 3. Set new access token
        const { accessToken, refreshToken: newRefreshToken } = data;

        if (!accessToken) {
            return NextResponse.json(
                { message: "Invalid response from authentication service" },
                { status: 500 }
            );
        }

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax" as const,
        };

        const response = NextResponse.json(
            { message: "Token refreshed successfully" },
            { status: 200 }
        );

        // Set new access token
        response.cookies.set("session_token", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 30, // 30 minutes
        });

        // Update refresh token if provided
        if (newRefreshToken) {
            response.cookies.set("refresh_token", newRefreshToken, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
        }

        return response;
    } catch (error) {
        console.error("Token refresh error:", error);
        return NextResponse.json(
            { message: "An error occurred during token refresh" },
            { status: 500 }
        );
    }
}
