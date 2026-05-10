import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"vendors" | "orders">("vendors");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vendorRes = await api.get("/vendors?limit=50");
                setVendors(vendorRes.data.data.vendors);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => { logout(); navigate("/login"); };

    const stats = {
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.isActive).length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "sans-serif" }}>

            {/* Navbar */}
            <div style={{
                background: "#1E293B", borderBottom: "1px solid #334155",
                padding: "16px 32px", display: "flex",
                justifyContent: "space-between", alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>🚇</span>
                    <span style={{ color: "#A78BFA", fontWeight: 700, fontSize: 18 }}>MetroCafe</span>
                    <span style={{ background: "#7F1D1D", color: "#FCA5A5", fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>
                        SUPER ADMIN
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "#94A3B8", fontSize: 14 }}>👋 {user?.name}</span>
                    <button onClick={handleLogout} style={{
                        background: "#7F1D1D", color: "#FCA5A5", border: "none",
                        borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
                    }}>Logout</button>
                </div>
            </div>

            <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
                <h2 style={{ color: "#E2E8F0", marginBottom: 24 }}>Admin Overview</h2>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                    {[
                        { label: "Total Vendors", value: stats.totalVendors, icon: "🏪", color: "#6366F1" },
                        { label: "Active Vendors", value: stats.activeVendors, icon: "✅", color: "#10B981" },
                        { label: "Total Revenue", value: `₹${stats.totalRevenue}`, icon: "💰", color: "#F59E0B" },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: "#1E293B", border: `1px solid ${stat.color}30`,
                            borderRadius: 12, padding: 20,
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                            <div style={{ color: stat.color, fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
                            <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {(["vendors", "orders"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            background: activeTab === tab ? "#6366F1" : "#1E293B",
                            color: activeTab === tab ? "#fff" : "#94A3B8",
                            border: "none", borderRadius: 8,
                            padding: "10px 20px", cursor: "pointer",
                            fontSize: 13, fontWeight: 600,
                            textTransform: "capitalize",
                        }}>{tab === "vendors" ? "🏪 Vendors" : "📦 Orders"}</button>
                    ))}
                </div>

                {/* Vendors Tab */}
                {activeTab === "vendors" && (
                    <div>
                        {isLoading ? (
                            <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>Loading...</div>
                        ) : vendors.length === 0 ? (
                            <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>No vendors found</div>
                        ) : vendors.map(vendor => (
                            <div key={vendor._id} style={{
                                background: "#1E293B", borderRadius: 12, padding: 20,
                                marginBottom: 12, display: "flex",
                                justifyContent: "space-between", alignItems: "center",
                                border: "1px solid #334155",
                            }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                        <span style={{ fontSize: 24 }}>☕</span>
                                        <span style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 16 }}>{vendor.name}</span>
                                        <span style={{
                                            background: vendor.isActive ? "#064E3B" : "#7F1D1D",
                                            color: vendor.isActive ? "#10B981" : "#EF4444",
                                            fontSize: 11, padding: "2px 10px", borderRadius: 20,
                                        }}>
                                            {vendor.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div style={{ color: "#64748B", fontSize: 13 }}>
                                        🚇 {vendor.stationLocation?.metroLine} • {vendor.stationLocation?.stationName}
                                    </div>
                                    <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
                                        👤 Owner: {vendor.owner?.name || vendor.owner}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <span style={{
                                        background: vendor.settings?.acceptingOrders ? "#064E3B" : "#334155",
                                        color: vendor.settings?.acceptingOrders ? "#10B981" : "#94A3B8",
                                        fontSize: 12, padding: "6px 14px", borderRadius: 8,
                                    }}>
                                        {vendor.settings?.acceptingOrders ? "✅ Open" : "❌ Closed"}
                                    </span>
                                    <span style={{ color: "#64748B", fontSize: 12, padding: "6px 0" }}>
                                        ⏱ {vendor.settings?.averagePrepTime} min
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                    <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                        <p>Global order view — coming soon!</p>
                        <p style={{ fontSize: 13 }}>Socket.io se real-time orders yahan dikhenge</p>
                    </div>
                )}
            </div>
        </div>
    );
}