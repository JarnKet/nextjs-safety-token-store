// File: hooks/auth-hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Types
interface LoginCredentials {
    username: string;
    password: string;
}

interface UpdateProfileData {
    firstName: string;
    lastName: string;
    email: string;
}

// API Functions
const authApi = {
    login: async (credentials: LoginCredentials) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return response.json();
    },

    getProfile: async () => {
        const response = await fetch("/api/me", {
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("UNAUTHORIZED");
            }
            const error = await response.json();
            throw new Error(error.message);
        }

        return response.json();
    },

    updateProfile: async (data: UpdateProfileData & { userId: number }) => {
        const response = await fetch("/api/me/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return response.json();
    },
};

// Hooks
export const useLogin = () => {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            if (data.user) {
                setUser(data.user);
            }
            router.push("/dashboard");
        },
    });
};

export const useProfile = () => {
    const setUser = useAuthStore((state) => state.setUser);

    const query = useQuery({
        queryKey: ["profile"],
        queryFn: authApi.getProfile,
        retry: (failureCount, error: Error) => {
            return error.message !== "UNAUTHORIZED" && failureCount < 2;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    });

    // Handle success/error with useEffect alternative
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
        if (query.error?.message === "UNAUTHORIZED") {
            setUser(null);
            window.location.href = "/login";
        }
    }, [query.data, query.error, setUser]);

    return query;
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: (data) => {
            updateUser(data);
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};
