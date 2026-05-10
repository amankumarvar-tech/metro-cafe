import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

interface Vendor {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    stationLocation: {
        metroLine: string;
        stationName: string;
    };
    settings: { acceptingOrders: boolean; averagePrepTime: number };
    rating: { total: number; count: number };
}

export default function CustomerHome() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/vendors")
            .then((res) => setVendors(res.data.data.vendors))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = vendors.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.stationLocation.stationName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "sans-serif" }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #1E1B4B, #0F172A)",
                padding: "40px 32px",
                textAlign: "center",
                borderBottom: "1px solid #1E293B",
            }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🚇</div>
                <h1 style={{
                    color: "#A78BFA", margin: "0 0 8px",
                    fontSize: 32, fontWeight: 800,
                }}>MetroCafe</h1>
                <p style={{ color: "#64748B", margin: "0 0 24px" }}>
                    Order from cafes at your metro station
                </p>

                {/* Search */}
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Search cafe or station..."
                    style={{
                        width: "100%", maxWidth: 400,
                        background: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: 12, padding: "14px 20px",
                        color: "#E2E8F0", fontSize: 15,
                        outline: "none", boxSizing: "border-box",
                    }}
                />
            </div>

            {/* Vendors Grid */}
            <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
                <h2 style={{ color: "#E2E8F0", marginBottom: 24 }}>
                    Cafes Near You ({filtered.length})
                </h2>

                {isLoading ? (
                    <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>
                        Loading cafes... ⏳
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>
                        No cafes found 😔
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 20,
                    }}>
                        {filtered.map((vendor) => (
                            <div
                                key={vendor._id}
                                onClick={() => navigate(`/menu/${vendor.slug}`)}
                                style={{
                                    background: "#1E293B",
                                    borderRadius: 16, padding: 24,
                                    cursor: "pointer",
                                    border: "1px solid #334155",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "#6366F1";
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.borderColor = "#334155";
                                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                }}
                            >
                                {/* Cafe Logo */}
                                <div style={{
                                    width: 60, height: 60, borderRadius: 12,
                                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: 28,
                                    marginBottom: 16,
                                }}>
                                    ☕
                                </div>

                                <h3 style={{ color: "#E2E8F0", margin: "0 0 8px", fontSize: 18 }}>
                                    {vendor.name}
                                </h3>

                                <div style={{ color: "#64748B", fontSize: 13, marginBottom: 12 }}>
                                    🚇 {vendor.stationLocation.metroLine} •{" "}
                                    {vendor.stationLocation.stationName}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{
                                        background: vendor.settings.acceptingOrders ? "#064E3B" : "#7F1D1D",
                                        color: vendor.settings.acceptingOrders ? "#10B981" : "#EF4444",
                                        fontSize: 12, padding: "4px 12px", borderRadius: 20,
                                    }}>
                                        {vendor.settings.acceptingOrders ? "✅ Open" : "❌ Closed"}
                                    </span>
                                    <span style={{ color: "#64748B", fontSize: 13 }}>
                                        ⏱ {vendor.settings.averagePrepTime} min
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}