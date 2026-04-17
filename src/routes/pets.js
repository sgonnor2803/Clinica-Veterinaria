import express from "express";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRole } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("pets")
    .select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

router.post(
  "/",
  authMiddleware,
  checkRole(["vet", "admin"]),
  async (req, res) => {
    const { name, adopted } = req.body;

    const { data, error } = await supabase
      .from("pets")
      .insert([
        {
          name,
          adopted: adopted || false,
          owner_id: null,
        },
      ])
      .select();

    if (error) return res.status(500).json(error);

    res.json(data);
  }
);

router.post("/adopt/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();

  if (petError) return res.status(500).json(petError);

  if (pet.owner_id && pet.owner_id !== req.user.id) {
    return res.status(403).json({ error: "ABAC denied" });
  }

  const { data, error } = await supabase
    .from("pets")
    .update({
      adopted: true,
      owner_id: req.user.id,
    })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json(error);

  res.json(data);
});

export default router;