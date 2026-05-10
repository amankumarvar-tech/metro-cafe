import { Router } from "express";
import ordersRouter from "./orders";

const router = Router();

// Mount all route modules
router.use("/orders", ordersRouter);

// Health check
router.get("/health", (req, res) => {
    res.json({ status: "✅ Metro Cafe API running!" });
});

export default router;
