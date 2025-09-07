// File: app/api/me/update/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
    try {
        // 1. ตรวจสอบ Token
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

        const body = await request.json();
        const { userId, firstName, lastName, email } = body;

        // Input validation
        if (!userId) {
            return NextResponse.json(
                { message: "User ID is required" },
                { status: 400 }
            );
        }

        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { message: "First name, last name, and email are required" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }

        // 2. ส่ง request อัปเดตไปยัง API ภายนอก
        const res = await fetch(`https://dummyjson.com/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenCookie.value}`,
                "User-Agent": "NextJS-App/1.0",
            },
            body: JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
            }),
        });

        const updatedUserData = await res.json();

        if (!res.ok) {
            // Handle token expiration
            if (res.status === 401) {
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

            return NextResponse.json(
                { message: updatedUserData.message || "Failed to update user" },
                {
                    status: res.status,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        // 3. ส่งข้อมูลที่อัปเดตแล้วกลับไปให้ Client
        return NextResponse.json(updatedUserData, {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { message: "An error occurred during update" },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
