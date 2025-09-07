// File: contexts/AuthContext.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";

// 1. กำหนด Type ของข้อมูล User
interface IUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
}

// 2. กำหนด Type ของ Context
interface IAuthContext {
    user: IUser | null;
    loading: boolean;
    login: (userData: IUser) => void;
    logout: () => Promise<void>;
    updateUserContext: (updatedData: Partial<IUser>) => void;
    isAuthenticated: boolean;
}

// 3. สร้าง Context พร้อมค่าเริ่มต้น
const AuthContext = createContext<IAuthContext | undefined>(undefined);

// 4. สร้าง Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Function to clear user state
    const clearUser = useCallback(() => {
        setUser(null);
    }, []);

    // Function to set user data after login
    const login = useCallback((userData: IUser) => {
        setUser(userData);
    }, []);

    // Function to handle logout
    const logout = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                clearUser();
                // Redirect to login page
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout failed:", error);
            // Clear user data even if logout request fails
            clearUser();
            window.location.href = "/login";
        }
    }, [clearUser]);

    // 5. useEffect จะทำงานครั้งเดียวเมื่อแอปโหลด เพื่อตรวจสอบสถานะ Login
    useEffect(() => {
        let mounted = true;

        const checkUserStatus = async () => {
            try {
                const response = await fetch("/api/me", {
                    credentials: "include",
                    cache: "no-store",
                });

                if (response.ok) {
                    const userData = await response.json();
                    if (mounted) {
                        setUser(userData);
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                    }

                    // If token is invalid and we're on a protected route, redirect to login
                    if (
                        response.status === 401 &&
                        window.location.pathname.startsWith("/dashboard")
                    ) {
                        window.location.href = "/login";
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user status", error);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkUserStatus();

        return () => {
            mounted = false;
        };
    }, []);

    // Function to update user data in the context
    const updateUserContext = useCallback((updatedData: Partial<IUser>) => {
        setUser((prevUser) =>
            prevUser ? { ...prevUser, ...updatedData } : null
        );
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        updateUserContext,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// 5. สร้าง Custom Hook เพื่อให้เรียกใช้ Context ได้ง่าย
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
