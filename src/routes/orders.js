import express from "express";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRole } from "../middleware/rbac.js";

const router = express.Router();


// 🧾 CREATE order (solo client/admin)
router.post("/", authMiddleware, async (req, res) => {
  const { total } = req.body;

  // 🔐 FORZAMOS usuario real (NO se puede falsificar)
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("orders")
    .insert([{ user_id, total }])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});


// 🔐 GET order (ABAC)
router.get("/:id", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(500).json(error);

  if (!data) {
    return res.status(404).json({ error: "Order not found" });
  }

  // 🧬 ABAC: solo dueño o admin
  if (data.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "ABAC denied" });
  }

  res.json(data);
});


// 🟡 GET all orders (solo admin/sales)
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "sales"]),
  async (req, res) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*");

    if (error) return res.status(500).json(error);

    res.json(data);
  }
);

export default router;