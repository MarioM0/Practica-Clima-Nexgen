// src/controllers/weather.controller.js
const WeatherService = require("../services/weather.service");

class WeatherController {
  static async getWeatherByCity(req, res, next) {
    try {
      const ciudad = req.query.ciudad || "Ciudad desconocida";

      const dataClima = await WeatherService.getWeatherByCity(ciudad);

      res.json(dataClima);
    } catch (error) {
      next(error); // se lo pasamos al middleware de errores en app.js
    }
  }

  static async get7DayForecast(req, res, next) {
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
}

}



module.exports = WeatherController;
