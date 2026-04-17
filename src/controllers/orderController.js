import { supabase } from "../config/supabase.js";

export async function createOrder(req, res) {
  const { items } = req.body;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id: req.user.sub, total: 0 }])
    .select()
    .single();

  if (orderError) return res.status(500).json(orderError);

  let total = 0;

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.product_id)
      .single();

    total += product.price * item.quantity;

    await supabase.from("order_items").insert([
      {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
      },
    ]);
  }

  await supabase.from("orders").update({ total }).eq("id", order.id);

  res.json({ message: "Pedido creado", orderId: order.id });
}

export async function getOrder(req, res) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(500).json(error);

  if (data.user_id !== req.user.sub) {
    return res.status(403).json({ error: "No autorizado" });
  }

  res.json(data);
}