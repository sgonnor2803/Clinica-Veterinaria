import express from "express";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRole } from "../middleware/rbac.js";

const router = express.Router();


// 🏥 CREATE appointment (client, vet, admin)
router.post("/", authMiddleware, async (req, res) => {
  const { vet_id, date, description } = req.body;

  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("appointments")
    .insert([
      {
        user_id,
        vet_id,
        date,
        description,
      },
    ])
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});


// 🔐 GET all appointments (solo vet/admin)
router.get(
  "/",
  authMiddleware,
  checkRole(["vet", "admin"]),
  async (req, res) => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*");

    if (error) return res.status(500).json(error);

    res.json(data);
  }
);


// 🧬 GET my appointments (ABAC)
router.get("/me", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json(error);

  res.json(data);
});

export default router;