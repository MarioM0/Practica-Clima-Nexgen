// src/controllers/city.controller.js
const CityService = require("../services/city.service");

class CityController {
  static async search(req, res, next) {
    try {
      const q = req.query.q || "";
      const results = await CityService.searchCities(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CityController;
