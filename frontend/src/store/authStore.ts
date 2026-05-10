import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api from "../lib/api";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "super_admin" | "vendor_owner" | "vendor_staff" | "customer";
    vendor?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                token: null,
                isLoading: false,
                error: null,

                login: async (email, password) => {
                    set({ isLoading: true, error: null });
                    try {
                        const { data } = await api.post("/auth/login", { email, password });
                        localStorage.setItem("accessToken", data.data.accessToken);
                        localStorage.setItem("refreshToken", data.data.refreshToken);
                        set({
                            user: data.data.user,
                            token: data.data.accessToken,
                            isLoading: false,
                        });
                    } catch (error: any) {
                        set({
                            error: error.response?.data?.message || "Login failed",
                            isLoading: false,
                        });
                    }
                },

                register: async (registerData) => {
                    set({ isLoading: true, error: null });
                    try {
                        const { data } = await api.post("/auth/register", registerData);
                        localStorage.setItem("accessToken", data.data.accessToken);
                        localStorage.setItem("refreshToken", data.data.refreshToken);
                        set({
                            user: data.data.user,
                            token: data.data.accessToken,
                            isLoading: false,
                        });
                    } catch (error: any) {
                        set({
                            error: error.response?.data?.message || "Registration failed",
                            isLoading: false,
                        });
                    }
                },

                logout: () => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    set({ user: null, token: null });
                },

                clearError: () => set({ error: null }),
            }),
            { name: "auth-storage" }
        )
    )
);