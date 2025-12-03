// src/app.js
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api", routes);

// Manejo básico de ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo básico de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

module.exports = app;
