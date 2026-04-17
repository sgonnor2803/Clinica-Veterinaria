import express from "express";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRole } from "../middleware/rbac.js";

const router = express.Router();


// 🧩 función interna (sin archivo extra si quieres simple)
async function hasAdoptionDiscount(userId) {
  const { data } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", userId)
    .eq("adopted", true);

  return data?.length > 0;
}


// 🟢 GET all products (con descuento dinámico)
router.get("/", authMiddleware, async (req, res) => {
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) return res.status(500).json(error);

  // 💸 comprobar adopción
  const discountActive = await hasAdoptionDiscount(req.user.id);

  const result = products.map((p) => ({
    ...p,
    originalPrice: p.price,
    price: discountActive ? +(p.price * 0.8).toFixed(2) : p.price,
    discountApplied: discountActive,
  }));

  res.json(result);
});


// 🔐 CREATE product (RBAC)
router.post(
  "/",
  authMiddleware,
  checkRole(["admin", "sales"]),
  async (req, res) => {
    const { name, price, type } = req.body;

    const { data, error } = await supabase
      .from("products")
      .insert([{ name, price, type }])
      .select();

    if (error) return res.status(500).json(error);

    res.json(data);
  }
);

export default router;