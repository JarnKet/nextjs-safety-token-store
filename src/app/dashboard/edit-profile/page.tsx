// File: app/dashboard/edit-profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProfilePage() {
    const { user, loading, updateUserContext } = useAuth();
    const router = useRouter();

    // สร้าง state สำหรับฟอร์ม โดยใช้ข้อมูลจาก context เป็นค่าเริ่มต้น
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear previous messages when user starts typing
        if (error) setError("");
        if (message) setMessage("");
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            setError("First name is required");
            return false;
        }
        if (!formData.lastName.trim()) {
            setError("Last name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError("");
        setMessage("");

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setMessage("Updating...");

        try {
            const res = await fetch("/api/me/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    userId: user.id, // ส่ง userId ไปด้วย
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim().toLowerCase(),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // อัปเดตข้อมูลใน Context ทันที!
                updateUserContext(data);
                setMessage("Profile updated successfully!");
                setTimeout(() => router.push("/dashboard"), 1500); // กลับไปหน้า dashboard
            } else {
                setError(data.message || "Failed to update profile");
                setMessage("");

                // Handle authentication errors
                if (res.status === 401) {
                    setTimeout(() => router.push("/login"), 2000);
                }
            }
        } catch (error) {
            console.error("Update error:", error);
            setError("An unexpected error occurred. Please try again.");
            setMessage("");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-gray-700 mb-4">
                        Please log in to edit your profile.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-white rounded-lg shadow-md w-full max-w-md"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Edit Profile
                </h1>

                {/* Success Message */}
                {message && (
                    <div className="mb-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded-md text-center">
                        {message}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-center">
                        {error}
                    </div>
                )}

                {/* First Name */}
                <div className="mb-4">
                    <label
                        htmlFor="firstName"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        required
                    />
                </div>

                {/* Last Name */}
                <div className="mb-4">
                    <label
                        htmlFor="lastName"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        required
                    />
                </div>

                {/* Email */}
                <div className="mb-6">
                    <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        required
                    />
                </div>

                <div className="space-y-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="w-full py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
