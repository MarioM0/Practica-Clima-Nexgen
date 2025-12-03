// src/controllers/weather.controller.js
const WeatherService = require("../services/weather.service");

class WeatherController {
  static async getWeatherByCity(req, res, next) {
    try {
      const ciudad = req.query.ciudad || "Ciudad desconocida";

      const dataClima = await WeatherService.getWeatherByCity(ciudad);

      res.json(dataClima);
    } catch (error) {
      next(error); // se lo pasa al middleware de errores en app.js
    }
  }
}

module.exports = WeatherController;
