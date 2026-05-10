import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { order } = state || {};

    if (!order) {
        navigate("/");
        return null;
    }

    return (
        <div style={{
            minHeight: "100vh", background: "#0A0E1A",
            fontFamily: "sans-serif", display: "flex",
            alignItems: "center", justifyContent: "center",
        }}>
            <div style={{
                background: "#1E293B", borderRadius: 20,
                padding: 40, maxWidth: 420, width: "100%",
                textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}>
                {/* Success Icon */}
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>

                <h1 style={{ color: "#10B981", margin: "0 0 8px", fontSize: 24 }}>
                    Order Placed!
                </h1>
                <p style={{ color: "#64748B", margin: "0 0 32px" }}>
                    Your order has been received
                </p>

                {/* Pickup Token */}
                <div style={{
                    background: "#064E3B", border: "2px solid #10B981",
                    borderRadius: 16, padding: 24, marginBottom: 24,
                }}>
                    <div style={{ color: "#10B981", fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>
                        PICKUP TOKEN
                    </div>
                    <div style={{
                        color: "#fff", fontSize: 56, fontWeight: 900,
                        letterSpacing: 8,
                    }}>
                        {order.pickupToken}
                    </div>
                    <div style={{ color: "#64748B", fontSize: 12, marginTop: 8 }}>
                        Show this token at the counter
                    </div>
                </div>

                {/* Order Details */}
                <div style={{
                    background: "#0F172A", borderRadius: 12,
                    padding: 16, marginBottom: 24, textAlign: "left",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#64748B", fontSize: 13 }}>Order Number</span>
                        <span style={{ color: "#E2E8F0", fontSize: 13 }}>{order.orderNumber}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#64748B", fontSize: 13 }}>Total</span>
                        <span style={{ color: "#10B981", fontSize: 13, fontWeight: 700 }}>₹{order.pricing?.total}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B", fontSize: 13 }}>Status</span>
                        <span style={{ color: "#F59E0B", fontSize: 13 }}>⏳ Pending</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    style={{
                        width: "100%", background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                        color: "#fff", border: "none", borderRadius: 12,
                        padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}