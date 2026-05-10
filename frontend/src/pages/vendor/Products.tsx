import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface Product {
    _id: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    preparationTime: number;
    isAvailable: boolean;
    dietary: { isVeg: boolean };
}

const emptyForm = {
    name: "",
    description: "",
    category: "",
    price: 0,
    preparationTime: 10,
    isVeg: true,
};

export default function VendorProducts() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [vendorId, setVendorId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const fetchVendorAndProducts = async () => {
            try {
                const vendorRes = await api.get(`/vendors`);
                const myVendor = vendorRes.data.data.vendors.find(
                    (v: any) => v.owner._id === user?._id || v.owner === user?._id
                );
                if (!myVendor) return;
                setVendorId(myVendor._id);

                const productRes = await api.get(`/products/vendor/${myVendor._id}`);
                setProducts(productRes.data.data.products);
            } catch (err) {
                toast.error("Failed to load products");
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendorAndProducts();
    }, []);

    const handleSubmit = async () => {
        if (!form.name || !form.category || !form.price) {
            toast.error("Name, Category aur Price required hai!");
            return;
        }
        try {
            const payload = {
                vendorId,
                name: form.name,
                description: form.description,
                category: form.category,
                price: Number(form.price),
                preparationTime: Number(form.preparationTime),
                isAvailable: true,
                dietary: { isVeg: form.isVeg },
            };

            if (editingId) {
                await api.patch(`/products/${editingId}`, payload);
                toast.success("Product updated!");
            } else {
                await api.post("/products", payload);
                toast.success("Product added!");
            }

            // Refresh
            const productRes = await api.get(`/products/vendor/${vendorId}`);
            setProducts(productRes.data.data.products);
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed!");
        }
    };

    const handleEdit = (product: Product) => {
        setForm({
            name: product.name,
            description: product.description || "",
            category: product.category,
            price: product.price,
            preparationTime: product.preparationTime,
            isVeg: product.dietary.isVeg,
        });
        setEditingId(product._id);
        setShowForm(true);
    };

    const handleToggle = async (product: Product) => {
        try {
            await api.patch(`/products/${product._id}`, {
                isAvailable: !product.isAvailable,
            });
            setProducts(prev =>
                prev.map(p => p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p)
            );
            toast.success(`${product.name} ${!product.isAvailable ? "enabled" : "disabled"}!`);
        } catch {
            toast.error("Failed to update!");
        }
    };

    const inputStyle = {
        width: "100%", background: "#0F172A",
        border: "1px solid #334155", borderRadius: 8,
        padding: "10px 14px", color: "#E2E8F0",
        fontSize: 14, outline: "none", boxSizing: "border-box" as const,
    };

    const labelStyle = {
        color: "#94A3B8", fontSize: 13,
        display: "block", marginBottom: 6,
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
                    <span style={{ background: "#4C1D95", color: "#A78BFA", fontSize: 11, padding: "2px 10px", borderRadius: 20 }}>VENDOR</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => navigate("/vendor/dashboard")} style={{
                        background: "#1E293B", color: "#94A3B8", border: "1px solid #334155",
                        borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
                    }}>← Dashboard</button>
                </div>
            </div>

            <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ color: "#E2E8F0", margin: 0 }}>Menu Management</h2>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
                        style={{
                            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            color: "#fff", border: "none", borderRadius: 8,
                            padding: "10px 20px", cursor: "pointer", fontWeight: 600,
                        }}
                    >+ Add Product</button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div style={{
                        background: "#1E293B", borderRadius: 16,
                        padding: 24, marginBottom: 24,
                        border: "1px solid #6366F1",
                    }}>
                        <h3 style={{ color: "#A78BFA", margin: "0 0 20px", fontSize: 16 }}>
                            {editingId ? "Edit Product" : "Add New Product"}
                        </h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Product Name *</label>
                                <input
                                    style={inputStyle}
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Masala Chai"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Category *</label>
                                <select
                                    style={inputStyle}
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Meals">Meals</option>
                                    <option value="Desserts">Desserts</option>
                                    <option value="Breakfast">Breakfast</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Price (₹) *</label>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: +e.target.value })}
                                    placeholder="30"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Prep Time (min)</label>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    value={form.preparationTime}
                                    onChange={e => setForm({ ...form, preparationTime: +e.target.value })}
                                    placeholder="10"
                                />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Description</label>
                                <input
                                    style={inputStyle}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description..."
                                />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <label style={{ ...labelStyle, margin: 0 }}>Veg</label>
                                <input
                                    type="checkbox"
                                    checked={form.isVeg}
                                    onChange={e => setForm({ ...form, isVeg: e.target.checked })}
                                    style={{ width: 18, height: 18, cursor: "pointer" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                            <button onClick={handleSubmit} style={{
                                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                color: "#fff", border: "none", borderRadius: 8,
                                padding: "10px 24px", cursor: "pointer", fontWeight: 600,
                            }}>
                                {editingId ? "Update" : "Add Product"}
                            </button>
                            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{
                                background: "#334155", color: "#94A3B8", border: "none",
                                borderRadius: 8, padding: "10px 20px", cursor: "pointer",
                            }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Products List */}
                {isLoading ? (
                    <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>Loading... ⏳</div>
                ) : products.length === 0 ? (
                    <div style={{ color: "#64748B", textAlign: "center", padding: 60 }}>
                        No products yet — Add your first item! 🍵
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product._id} style={{
                            background: "#1E293B", borderRadius: 12, padding: 16,
                            marginBottom: 12, display: "flex",
                            justifyContent: "space-between", alignItems: "center",
                            border: "1px solid #334155",
                            opacity: product.isAvailable ? 1 : 0.5,
                        }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span>{product.dietary.isVeg ? "🟢" : "🔴"}</span>
                                    <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{product.name}</span>
                                    <span style={{
                                        background: "#1E293B", border: "1px solid #334155",
                                        color: "#64748B", fontSize: 11, padding: "2px 8px", borderRadius: 10,
                                    }}>{product.category}</span>
                                </div>
                                <div style={{ color: "#10B981", fontWeight: 700 }}>₹{product.price}</div>
                                {product.description && (
                                    <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>{product.description}</div>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleToggle(product)} style={{
                                    background: product.isAvailable ? "#064E3B" : "#334155",
                                    color: product.isAvailable ? "#10B981" : "#94A3B8",
                                    border: "none", borderRadius: 8,
                                    padding: "8px 14px", cursor: "pointer", fontSize: 12,
                                }}>
                                    {product.isAvailable ? "✅ Available" : "❌ Hidden"}
                                </button>
                                <button onClick={() => handleEdit(product)} style={{
                                    background: "#1D4ED8", color: "#fff", border: "none",
                                    borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12,
                                }}>✏️ Edit</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}