import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "customer",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(form);
        const user = useAuthStore.getState().user;
        if (user) {
            if (user.role === "vendor_owner") navigate("/vendor/dashboard");
            else navigate("/");
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
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🚇</div>
                    <h1 style={{ color: "#A78BFA", margin: 0, fontSize: 24 }}>MetroCafe</h1>
                    <p style={{ color: "#64748B", margin: "8px 0 0" }}>Create your account</p>
                </div>

                {error && (
                    <div style={{
                        background: "#7F1D1D", border: "1px solid #EF4444",
                        borderRadius: 8, padding: "12px 16px", marginBottom: 20,
                        color: "#FCA5A5", fontSize: 14, display: "flex", justifyContent: "space-between",
                    }}>
                        {error}
                        <span style={{ cursor: "pointer" }} onClick={clearError}>✕</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {[
                        { label: "Full Name", key: "name", type: "text", placeholder: "Aman Kumar" },
                        { label: "Email", key: "email", type: "email", placeholder: "aman@test.com" },
                        { label: "Phone", key: "phone", type: "tel", placeholder: "9060655645" },
                        { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
                    ].map((field) => (
                        <div key={field.key} style={{ marginBottom: 16 }}>
                            <label style={{ color: "#94A3B8", fontSize: 13, display: "block", marginBottom: 6 }}>
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={(form as any)[field.key]}
                                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                required
                                style={{
                                    width: "100%", background: "#0F172A",
                                    border: "1px solid #334155", borderRadius: 8,
                                    padding: "12px 16px", color: "#E2E8F0",
                                    fontSize: 14, outline: "none", boxSizing: "border-box",
                                }}
                            />
                        </div>
                    ))}

                    {/* Role Select */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ color: "#94A3B8", fontSize: 13, display: "block", marginBottom: 6 }}>
                            Register As
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            style={{
                                width: "100%", background: "#0F172A",
                                border: "1px solid #334155", borderRadius: 8,
                                padding: "12px 16px", color: "#E2E8F0",
                                fontSize: 14, outline: "none", boxSizing: "border-box",
                            }}
                        >
                            <option value="customer">Customer</option>
                            <option value="vendor_owner">Cafe Owner</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            background: isLoading ? "#4C1D95" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            color: "#fff", border: "none", borderRadius: 8,
                            padding: "14px", fontSize: 15, fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p style={{ color: "#64748B", textAlign: "center", marginTop: 24, fontSize: 14 }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#A78BFA", textDecoration: "none" }}>
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
