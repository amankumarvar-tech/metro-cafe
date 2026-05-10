import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(form.email, form.password);
        const user = useAuthStore.getState().user;
        if (user) {
            if (user.role === "vendor_owner" || user.role === "vendor_staff") {
                navigate("/vendor/dashboard");
            } else if (user.role === "super_admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0A0E1A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
        }}>
            <div style={{
                background: "#1E293B",
                borderRadius: 16,
                padding: 40,
                width: "100%",
                maxWidth: 400,
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🚇</div>
                    <h1 style={{ color: "#A78BFA", margin: 0, fontSize: 24 }}>MetroCafe</h1>
                    <p style={{ color: "#64748B", margin: "8px 0 0" }}>Sign in to your account</p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: "#7F1D1D",
                        border: "1px solid #EF4444",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 20,
                        color: "#FCA5A5",
                        fontSize: 14,
                        display: "flex",
                        justifyContent: "space-between",
                    }}>
                        {error}
                        <span style={{ cursor: "pointer" }} onClick={clearError}>✕</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ color: "#94A3B8", fontSize: 13, display: "block", marginBottom: 6 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="aman@test.com"
                            required
                            style={{
                                width: "100%",
                                background: "#0F172A",
                                border: "1px solid #334155",
                                borderRadius: 8,
                                padding: "12px 16px",
                                color: "#E2E8F0",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ color: "#94A3B8", fontSize: 13, display: "block", marginBottom: 6 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            style={{
                                width: "100%",
                                background: "#0F172A",
                                border: "1px solid #334155",
                                borderRadius: 8,
                                padding: "12px 16px",
                                color: "#E2E8F0",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            background: isLoading ? "#4C1D95" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "14px",
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p style={{ color: "#64748B", textAlign: "center", marginTop: 24, fontSize: 14 }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "#A78BFA", textDecoration: "none" }}>
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
