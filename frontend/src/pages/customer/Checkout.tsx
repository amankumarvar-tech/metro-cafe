import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import toast from "react-hot-toast";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { cart, vendor } = state || {};

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [isLoading, setIsLoading] = useState(false);

    const subtotal = cart?.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) || 0;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    const handleOrder = async () => {
        if (!form.name || !form.phone) {
            toast.error("Name aur Phone required hai!");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post("/orders", {
                vendorId: vendor._id,
                items: cart.map((item: any) => ({
                    productId: item._id,
                    quantity: item.quantity,
                })),
                customer: form,
                payment: { method: paymentMethod },
            });

            toast.success(`🎉 Order placed! Token: ${data.data.order.pickupToken}`);
            navigate("/order-success", { state: { order: data.data.order } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Order failed!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "sans-serif" }}>

            {/* Header */}
            <div style={{
                background: "#1E293B", borderBottom: "1px solid #334155",
                padding: "16px 32px", display: "flex", alignItems: "center", gap: 16,
            }}>
                <button onClick={() => navigate(-1)} style={{
                    background: "none", border: "none", color: "#A78BFA", cursor: "pointer", fontSize: 14,
                }}>← Back</button>
                <h1 style={{ color: "#E2E8F0", margin: 0, fontSize: 20 }}>Checkout</h1>
            </div>

            <div style={{ padding: "24px 32px", maxWidth: 600, margin: "0 auto" }}>

                {/* Order Summary */}
                <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h3 style={{ color: "#A78BFA", margin: "0 0 16px", fontSize: 14, letterSpacing: 2 }}>
                        ORDER SUMMARY
                    </h3>
                    {cart?.map((item: any) => (
                        <div key={item._id} style={{
                            display: "flex", justifyContent: "space-between",
                            color: "#E2E8F0", marginBottom: 8, fontSize: 14,
                        }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: "1px solid #334155", marginTop: 12, paddingTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: 13, marginBottom: 6 }}>
                            <span>Subtotal</span><span>₹{subtotal}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: 13, marginBottom: 6 }}>
                            <span>Tax (8%)</span><span>₹{tax}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981", fontWeight: 700, fontSize: 16 }}>
                            <span>Total</span><span>₹{total}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <h3 style={{ color: "#A78BFA", margin: "0 0 16px", fontSize: 14, letterSpacing: 2 }}>
                        YOUR DETAILS
                    </h3>
                    {[
                        { label: "Full Name *", key: "name", type: "text", placeholder: "Aman Kumar" },
                        { label: "Phone *", key: "phone", type: "tel", placeholder: "9060655645" },
                        { label: "Email (optional)", key: "email", type: "email", placeholder: "aman@test.com" },
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
                                style={{
                                    width: "100%", background: "#0F172A",
                                    border: "1px solid #334155", borderRadius: 8,
                                    padding: "12px 16px", color: "#E2E8F0",
                                    fontSize: 14, outline: "none", boxSizing: "border-box",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Payment Method */}
                <div style={{ background: "#1E293B", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <h3 style={{ color: "#A78BFA", margin: "0 0 16px", fontSize: 14, letterSpacing: 2 }}>
                        PAYMENT METHOD
                    </h3>
                    <div style={{ display: "flex", gap: 12 }}>
                        {["cash", "upi", "card"].map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                style={{
                                    flex: 1, padding: "12px",
                                    background: paymentMethod === method ? "#4C1D95" : "#0F172A",
                                    border: `2px solid ${paymentMethod === method ? "#A78BFA" : "#334155"}`,
                                    borderRadius: 8, color: paymentMethod === method ? "#A78BFA" : "#64748B",
                                    cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "uppercase",
                                }}
                            >
                                {method === "cash" ? "💵 Cash" : method === "upi" ? "📱 UPI" : "💳 Card"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Place Order */}
                <button
                    onClick={handleOrder}
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        background: isLoading ? "#4C1D95" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                        color: "#fff", border: "none", borderRadius: 12,
                        padding: "16px", fontSize: 16, fontWeight: 700,
                        cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                >
                    {isLoading ? "Placing order..." : `Place Order • ₹${total}`}
                </button>
            </div>
        </div>
    );
}