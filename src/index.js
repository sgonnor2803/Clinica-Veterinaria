import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/products.js";
import petRoutes from "./routes/pets.js";
import orderRoutes from "./routes/orders.js";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API veterinaria funcionando 🐾",
  });
});

app.use("/products", productRoutes);
app.use("/pets", petRoutes);
app.use("/orders", orderRoutes);
app.use("/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    code: "NOT_FOUND",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});