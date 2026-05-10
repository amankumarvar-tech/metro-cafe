import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

interface Product {
    _id: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    preparationTime: number;
    dietary: { isVeg: boolean };
    isAvailable: boolean;
}

interface CartItem extends Product {
    quantity: number;
}

export default function MenuPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState<any>(null);
    const [grouped, setGrouped] = useState<Record<string, Product[]>>({});
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vendorRes = await api.get(`/vendors/${slug}`);
                const v = vendorRes.data.data.vendor;
                setVendor(v);

                const productRes = await api.get(`/products/vendor/${v._id}`);
                setGrouped(productRes.data.data.grouped);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => {
            const existing = prev.find((i) => i._id === productId);
            if (existing?.quantity === 1) return prev.filter((i) => i._id !== productId);
            return prev.map((i) =>
                i._id === productId ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };

    const getQty = (productId: string) =>
        cart.find((i) => i._id === productId)?.quantity || 0;

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    if (isLoading) return (
        <div style={{ background: "#0A0E1A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
            Loading menu... ⏳
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "sans-serif", paddingBottom: 100 }}>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #1E1B4B, #0F172A)",
                padding: "24px 32px",
                borderBottom: "1px solid #1E293B",
            }}>
                <button onClick={() => navigate("/")} style={{
                    background: "none", border: "none", color: "#A78BFA",
                    cursor: "pointer", fontSize: 14, marginBottom: 12,
                }}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 12,
                        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                    }}>☕</div>
                    <div>
                        <h1 style={{ color: "#E2E8F0", margin: 0, fontSize: 22 }}>{vendor?.name}</h1>
                        <p style={{ color: "#64748B", margin: "4px 0 0", fontSize: 13 }}>
                            🚇 {vendor?.stationLocation?.metroLine} • {vendor?.stationLocation?.stationName}
                        </p>
                    </div>
                    <span style={{
                        marginLeft: "auto",
                        background: vendor?.settings?.acceptingOrders ? "#064E3B" : "#7F1D1D",
                        color: vendor?.settings?.acceptingOrders ? "#10B981" : "#EF4444",
                        padding: "6px 14px", borderRadius: 20, fontSize: 13,
                    }}>
                        {vendor?.settings?.acceptingOrders ? "✅ Open" : "❌ Closed"}
                    </span>
                </div>
            </div>

            {/* Menu */}
            <div style={{ padding: "24px 32px", maxWidth: 800, margin: "0 auto" }}>
                {Object.entries(grouped).map(([category, products]) => (
                    <div key={category} style={{ marginBottom: 32 }}>
                        <h2 style={{
                            color: "#A78BFA", fontSize: 16, letterSpacing: 2,
                            textTransform: "uppercase", marginBottom: 16,
                            borderBottom: "1px solid #1E293B", paddingBottom: 8,
                        }}>
                            {category}
                        </h2>
                        {products.map((product) => (
                            <div key={product._id} style={{
                                background: "#1E293B", borderRadius: 12,
                                padding: 16, marginBottom: 12,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                border: "1px solid #334155",
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 16 }}>{product.dietary.isVeg ? "🟢" : "🔴"}</span>
                                        <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{product.name}</span>
                                    </div>
                                    {product.description && (
                                        <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 8px" }}>
                                            {product.description}
                                        </p>
                                    )}
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <span style={{ color: "#10B981", fontWeight: 700, fontSize: 16 }}>₹{product.price}</span>
                                        <span style={{ color: "#64748B", fontSize: 13 }}>⏱ {product.preparationTime} min</span>
                                    </div>
                                </div>

                                {/* Add/Remove buttons */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {getQty(product._id) > 0 ? (
                                        <>
                                            <button onClick={() => removeFromCart(product._id)} style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: "#334155", color: "#E2E8F0",
                                                border: "none", cursor: "pointer", fontSize: 18,
                                            }}>−</button>
                                            <span style={{ color: "#E2E8F0", fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                                                {getQty(product._id)}
                                            </span>
                                            <button onClick={() => addToCart(product)} style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: "#6366F1", color: "#fff",
                                                border: "none", cursor: "pointer", fontSize: 18,
                                            }}>+</button>
                                        </>
                                    ) : (
                                        <button onClick={() => addToCart(product)} style={{
                                            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                            color: "#fff", border: "none", borderRadius: 8,
                                            padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                                        }}>ADD</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Cart Bar */}
            {cartCount > 0 && (
                <div style={{
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    background: "#6366F1", padding: "16px 32px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <span style={{ color: "#fff", fontWeight: 600 }}>
                        🛒 {cartCount} items • ₹{cartTotal}
                    </span>
                    <button
                        onClick={() => navigate("/checkout", { state: { cart, vendor } })}
                        style={{
                            background: "#fff", color: "#6366F1",
                            border: "none", borderRadius: 8,
                            padding: "10px 24px", fontWeight: 700,
                            cursor: "pointer", fontSize: 14,
                        }}
                    >
                        Place Order →
                    </button>
                </div>
            )}
        </div>
    );
}