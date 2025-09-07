// File: app/login/page.tsx
"use client"; // ระบุว่าเป็น Client Component

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("emilys"); // pre-fill for testing
    const [password, setPassword] = useState("emilyspass"); // pre-fill for testing
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Input validation
            if (!username.trim() || !password) {
                setError("Username and password are required");
                return;
            }

            // ส่ง request ไปที่ API Route ของเราเอง (ไม่ใช่ dummyjson.com)
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Update auth context with user data
                if (data.user) {
                    login(data.user);
                }

                // Redirect to return URL or dashboard
                const returnTo = searchParams.get("returnTo") || "/dashboard";
                router.push(returnTo);
            } else {
                setError(data.message || "Failed to login");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                {error && (
                    <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-center">
                        {error}
                    </div>
                )}
                <div className="mb-4">
                    <label
                        htmlFor="username"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                        disabled={isLoading}
                        autoComplete="username"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
