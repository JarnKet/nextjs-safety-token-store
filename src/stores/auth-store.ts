// File: stores/auth-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set, get) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) =>
                set({ user, isAuthenticated: !!user }, false, "setUser"),

            updateUser: (userData) =>
                set(
                    (state) => ({
                        user: state.user
                            ? { ...state.user, ...userData }
                            : null,
                    }),
                    false,
                    "updateUser"
                ),

            logout: async () => {
                try {
                    await fetch("/api/auth/logout", {
                        method: "POST",
                        credentials: "include",
                    });
                } catch (error) {
                    console.error("Logout error:", error);
                } finally {
                    set(
                        { user: null, isAuthenticated: false },
                        false,
                        "logout"
                    );
                    window.location.href = "/login";
                }
            },
        }),
        { name: "auth-store" }
    )
);
