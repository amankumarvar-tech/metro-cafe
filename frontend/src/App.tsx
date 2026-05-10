import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VendorDashboard from "./pages/vendor/Dashboard";
import CustomerHome from "./pages/customer/Home";
import MenuPage from "./pages/customer/Menu";
import Checkout from "./pages/customer/Checkout";
import OrderSuccess from "./pages/customer/OrderSuccess";
import VendorProducts from "./pages/vendor/Products";
import AdminDashboard from "./pages/admin/Dashboard";
import VendorProfile from "./pages/vendor/Profile";

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu/:slug" element={<MenuPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        <Route path="/vendor/dashboard" element={
          <ProtectedRoute roles={["vendor_owner", "vendor_staff"]}>
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor/products" element={
          <ProtectedRoute roles={["vendor_owner", "vendor_staff"]}>
            <VendorProducts />
          </ProtectedRoute>
        } />
        <Route path="/vendor/profile" element={
          <ProtectedRoute roles={["vendor_owner", "vendor_staff"]}>
            <VendorProfile />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={["super_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;