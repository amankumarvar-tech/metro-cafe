import React, { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useVendorSocket } from "../../hooks/useVendorSocket";
import { getSocket } from "../../lib/socket";


export default function VendorDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const { orders, stats, newOrderAlert, dismissAlert } = useOrderStore();

    useVendorSocket();

    const handleLogout = () => { logout(); navigate("/login"); };

    const getOrdersByStatus = (status: string) =>
        orders.filter((o) => o.status === status);

    const updateStatus = (orderId: string, status: string) => {
        const socket = getSocket();
        if (socket) socket.emit("order:update_status", { orderId, status });
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "sans-serif" }}>

            {/* New Order Alert */}
            {newOrderAlert && (
                <div style={{
                    position: "fixed", top: 20, right: 20, zIndex: 1000,
                    background: "#064E3B", border: "2px solid #10B981",
                    borderRadius: 12, padding: "16px 20px", maxWidth: 320,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}>
                    <div style={{ color: "#10B981", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>🆕 New Order!</div>
                    <div style={{ color: "#E2E8F0", fontSize: 14 }}>#{newOrderAlert.orderNumber}</div>
                    <div style={{ color: "#94A3B8", fontSize: 13 }}>{newOrderAlert.customer.name} • ₹{newOrderAlert.pricing.total}</div>
                    <div style={{ color: "#94A3B8", fontSize: 13 }}>Token: <strong style={{ color: "#10B981" }}>{newOrderAlert.pickupToken}</strong></div>
                    <button onClick={dismissAlert} style={{
                        marginTop: 12, background: "#10B981", color: "#fff",
                        border: "none", borderRadius: 6, padding: "6px 16px",
                        cursor: "pointer", fontSize: 13, width: "100%",
                    }}>Got it ✓</button>
                </div>
            )}

            {/* Navbar */}
            <div style={{
                background: "#1E293B", borderBottom: "1px solid #334155",
                padding: "16px 32px", display: "flex",
                justifyContent: "space-between", alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>🚇</span>
                    <span style={{ color: "#A78BFA", fontWeight: 700, fontSize: 18 }}>MetroCafe</span>
                    <span style={{ background: "#4C1D95", color: "#A78BFA", fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>VENDOR</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => navigate("/vendor/products")} style={{
                        background: "#1E293B", color: "#A78BFA",
                        border: "1px solid #6366F1",
                        borderRadius: 8, padding: "8px 16px",
                        cursor: "pointer", fontSize: 13,
                    }}>📋 Menu</button>

                    <button onClick={() => navigate("/vendor/profile")} style={{
                        background: "#1E293B", color: "#A78BFA",
                        border: "1px solid #6366F1",
                        borderRadius: 8, padding: "8px 16px",
                        cursor: "pointer", fontSize: 13,
                    }}>⚙️ Profile</button>

                    <span style={{ color: "#94A3B8", fontSize: 14 }}>👋 {user?.name}</span>
                    <button onClick={handleLogout} style={{
                        background: "#7F1D1D", color: "#FCA5A5", border: "none",
                        borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
                    }}>Logout</button>
                </div>
            </div>

            <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
                <h2 style={{ color: "#E2E8F0", marginBottom: 24 }}>Dashboard Overview</h2>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
                    {[
                        { label: "Today's Orders", value: stats.total, icon: "📦", color: "#6366F1" },
                        { label: "Pending", value: stats.pending, icon: "⏳", color: "#F59E0B" },
                        { label: "Preparing", value: stats.preparing, icon: "👨‍🍳", color: "#8B5CF6" },
                        { label: "Revenue", value: `₹${stats.revenue}`, icon: "💰", color: "#10B981" },
                    ].map((stat) => (
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

                {/* Kanban */}
                <h3 style={{ color: "#E2E8F0", marginBottom: 16 }}>Live Orders</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {[
                        { status: "pending", label: "New Orders", color: "#F59E0B" },
                        { status: "confirmed", label: "Confirmed", color: "#3B82F6" },
                        { status: "preparing", label: "Preparing", color: "#8B5CF6" },
                        { status: "ready", label: "Ready", color: "#10B981" },
                    ].map((col) => (
                        <div key={col.status} style={{
                            background: "#1E293B", borderRadius: 12,
                            padding: 16, minHeight: 300,
                            borderTop: `3px solid ${col.color}`,
                        }}>
                            <div style={{ color: col.color, fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                                {col.label}
                                <span style={{ background: `${col.color}20`, padding: "2px 8px", borderRadius: 10, fontSize: 12 }}>
                                    {getOrdersByStatus(col.status).length}
                                </span>
                            </div>

                            {getOrdersByStatus(col.status).length === 0 ? (
                                <div style={{ color: "#475569", fontSize: 13, textAlign: "center", marginTop: 60 }}>No orders</div>
                            ) : (
                                getOrdersByStatus(col.status).map((order) => (
                                    <div key={order._id} style={{
                                        background: "#0F172A", borderRadius: 8,
                                        padding: 12, marginBottom: 8,
                                        border: "1px solid #1E293B",
                                    }}>
                                        <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600 }}>#{order.orderNumber}</div>
                                        <div style={{ color: "#94A3B8", fontSize: 12 }}>{order.customer.name}</div>
                                        <div style={{ color: col.color, fontSize: 13, marginTop: 4 }}>
                                            ₹{order.pricing.total} • Token: {order.pickupToken}
                                        </div>

                                        {/* Items */}
                                        <div style={{ marginTop: 8, borderTop: "1px solid #1E293B", paddingTop: 8 }}>
                                            {(order.items as any[]).map((item: any, i: number) => (
                                                <div key={i} style={{ color: "#64748B", fontSize: 11 }}>
                                                    {item.productName} × {item.quantity}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status Buttons */}
                                        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {col.status === "pending" && (
                                                <button onClick={() => updateStatus(order._id, "confirmed")} style={{
                                                    background: "#1D4ED8", color: "#fff", border: "none",
                                                    borderRadius: 6, padding: "6px 12px", fontSize: 11,
                                                    cursor: "pointer", fontWeight: 600,
                                                }}>✓ Confirm</button>
                                            )}
                                            {col.status === "confirmed" && (
                                                <button onClick={() => updateStatus(order._id, "preparing")} style={{
                                                    background: "#7C3AED", color: "#fff", border: "none",
                                                    borderRadius: 6, padding: "6px 12px", fontSize: 11,
                                                    cursor: "pointer", fontWeight: 600,
                                                }}>👨‍🍳 Preparing</button>
                                            )}
                                            {col.status === "preparing" && (
                                                <button onClick={() => updateStatus(order._id, "ready")} style={{
                                                    background: "#059669", color: "#fff", border: "none",
                                                    borderRadius: 6, padding: "6px 12px", fontSize: 11,
                                                    cursor: "pointer", fontWeight: 600,
                                                }}>✅ Ready</button>
                                            )}
                                            {col.status === "ready" && (
                                                <button onClick={() => updateStatus(order._id, "picked_up")} style={{
                                                    background: "#374151", color: "#fff", border: "none",
                                                    borderRadius: 6, padding: "6px 12px", fontSize: 11,
                                                    cursor: "pointer",
                                                }}>📦 Picked Up</button>
                                            )}
                                            <button onClick={() => updateStatus(order._id, "cancelled")} style={{
                                                background: "#7F1D1D", color: "#FCA5A5", border: "none",
                                                borderRadius: 6, padding: "6px 12px", fontSize: 11,
                                                cursor: "pointer",
                                            }}>✕</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}