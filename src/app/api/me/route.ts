// File: app/api/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        // 1. ดึง token จาก HttpOnly cookie
        const tokenCookie = (await cookies()).get("session_token");

        if (!tokenCookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                {
                    status: 401,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        const token = tokenCookie.value;

        // 2. ส่ง request ไปยัง API ภายนอกพร้อมแนบ Bearer Token
        const res = await fetch("https://dummyjson.com/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "NextJS-App/1.0",
            },
        });

        const data = await res.json();

        if (!res.ok) {
            // If token is invalid, clear cookies
            if (res.status === 401) {
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: -1,
                    path: "/",
                };

                const response = NextResponse.json(
                    { message: "Token expired" },
                    { status: 401 }
                );

                response.cookies.set("session_token", "", cookieOptions);
                response.cookies.set("refresh_token", "", cookieOptions);

                return response;
            }

            return NextResponse.json(
                { message: data.message || "Failed to fetch user data" },
                {
                    status: res.status,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        // 3. ส่งข้อมูลผู้ใช้กลับไปให้ Client
        return NextResponse.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Me API error:", error);
        return NextResponse.json(
            { message: "An unexpected error occurred." },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
