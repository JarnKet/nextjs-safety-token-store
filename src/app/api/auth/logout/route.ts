// File: app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // To "delete" a cookie, we set it again with a maxAge of -1.
        // This tells the browser to expire it immediately.

        // 1. Clear the access token cookie 🚪
        (await cookies()).set("session_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: -1,
            path: "/",
        });

        // 2. Clear the refresh token cookie
        (await cookies()).set("refresh_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: -1,
            path: "/",
        });

        return NextResponse.json(
            { message: "Logout successful" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "An error occurred" },
            { status: 500 }
        );
    }
}
