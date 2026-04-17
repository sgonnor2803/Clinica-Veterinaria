import { supabase } from "../config/supabase.js";

export async function createAppointment(req, res) {
  const { vet_id, date, description } = req.body;

  const { data, error } = await supabase.from("appointments").insert([
    {
      user_id: req.user.sub,
      vet_id,
      date,
      description,
    },
  ]);

  if (error) return res.status(500).json(error);

  res.json(data);
}

export async function getAppointments(req, res) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .or(`user_id.eq.${req.user.sub},vet_id.eq.${req.user.sub}`);

  if (error) return res.status(500).json(error);

  res.json(data);
}