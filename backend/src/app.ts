import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { connectDB } from "./config/database";
import { initializeSocket } from "./socket";
import authRoutes from "./routes/auth";
import vendorRoutes from "./routes/vendor";
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";

const app = express();
const httpServer = createServer(app);

initializeSocket(httpServer);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.get("/api/v1/health", (req, res) => {
    res.json({ status: "✅ Metro Cafe API running!" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚇 Server running on http://localhost:${PORT}`);
    });
});