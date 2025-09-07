// File: app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Input validation
        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required" },
                { status: 400 }
            );
        }

        // 1. Send credentials to the external API
        const res = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "NextJS-App/1.0",
            },
            body: JSON.stringify({
                username: username.trim(),
                password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: data.message || "Authentication failed" },
                { status: res.status }
            );
        }

        // 2. Extract the tokens from the successful response
        const { accessToken, refreshToken } = data;

        if (!accessToken || !refreshToken) {
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

        // 3. Set the access token cookie (session_token) 🔑
        (await cookies()).set("session_token", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 30, // 30 minutes
        });

        // 4. Set the refresh token cookie 🔄
        (await cookies()).set("refresh_token", refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        // 5. Return success with user data (excluding sensitive info)
        const { accessToken: _, refreshToken: __, ...userInfo } = data;

        return NextResponse.json(
            {
                message: "Login successful",
                user: userInfo,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
