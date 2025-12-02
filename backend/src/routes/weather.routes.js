// src/routes/weather.routes.js
const express = require("express");
const WeatherController = require("../controllers/weather.controller");
const WeatherService = require("../services/weather.service"); // 👈 importa el servicio

const router = express.Router();

// Clima actual: GET /api/clima?ciudad=Mazatlan
router.get("/", WeatherController.getWeatherByCity);

// Pronóstico 7 días: GET /api/clima/forecast?ciudad=Mazatlan
router.get("/forecast", async (req, res, next) => {
  try {
    const ciudad = req.query.ciudad || "Mazatlan";

    const dias = await WeatherService.get7DayForecastByCity(ciudad);

    res.json(dias);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
});

module.exports = router;
