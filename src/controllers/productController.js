import { supabase } from "../config/supabase.js";

export async function getProducts(req, res) {
  const { data, error } = await supabase.from("products").select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
}

export async function createProduct(req, res) {
  const { name, price, type } = req.body;

  const { data, error } = await supabase
    .from("products")
    .insert([{ name, price, type }]);

  if (error) return res.status(500).json(error);

  res.json(data);
}