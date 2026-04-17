import { supabase } from "../config/supabase.js";

export async function getPets(req, res) {
  const { data, error } = await supabase.from("pets").select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
}

export async function adoptPet(req, res) {
  const petId = req.params.id;

  const { error } = await supabase
    .from("pets")
    .update({
      adopted: true,
      owner_id: req.user.sub,
    })
    .eq("id", petId);

  if (error) return res.status(500).json(error);

  res.json({ message: "Mascota adoptada 🐾" });
}