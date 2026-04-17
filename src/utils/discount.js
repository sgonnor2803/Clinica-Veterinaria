import { supabase } from "../config/supabase.js";

export async function hasAdoptionDiscount(userId) {
  const { data, error } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", userId)
    .eq("adopted", true);

  if (error) return false;

  return data.length > 0;
}