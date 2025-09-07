// File: app/dashboard/page.tsx (Updated)
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext"; // 1. Import useAuth
import { useState } from "react";

export default function DashboardPage() {
    // 2. ดึงข้อมูล user และ loading มาจาก Context
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
            // Force redirect even if logout fails
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // 3. แสดงผลขณะกำลังโหลดข้อมูลจาก Context
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user data...</p>
                </div>
            </div>
        );
    }

    // 4. ถ้าโหลดเสร็จแล้วแต่ไม่มี user (อาจจะเพราะ token หมดอายุ)
    if (!user) {
        // Middleware ควรจะจัดการ redirect ไปแล้ว แต่เป็นการป้องกันอีกชั้น
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-700 mb-4">You are not logged in.</p>
                    <Link
                        href="/login"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // 5. แสดงข้อมูลผู้ใช้จาก Context
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">
                    Welcome to Dashboard!
                </h1>
                <img
                    src={user.image}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "/placeholder-avatar.png";
                    }}
                />
                <p className="text-lg text-gray-800 mb-2">
                    Hello,{" "}
                    <strong>
                        {user.firstName} {user.lastName}
                    </strong>
                </p>
                <p className="text-gray-600 mb-1">Username: {user.username}</p>
                <p className="text-gray-600 mb-6">Email: {user.email}</p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard/edit-profile"
                        className="block w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                        Edit Profile
                    </Link>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                </div>
            </div>
        </div>
    );
}
