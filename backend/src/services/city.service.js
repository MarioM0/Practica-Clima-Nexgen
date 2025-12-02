// src/services/city.service.js
const axios = require("axios");

const apiKey = process.env.OPENWEATHER_API_KEY;
const geoBaseUrl =
  process.env.OPENWEATHER_GEO_URL || "http://api.openweathermap.org/geo/1.0";

class CityService {
  static async searchCities(q) {
    if (!apiKey) {
      throw new Error("Falta configurar OPENWEATHER_API_KEY en el archivo .env");
    }

    if (!q || q.trim().length < 2) {
      return [];
    }

    const response = await axios.get(`${geoBaseUrl}/direct`, {
      params: {
        q,
        limit: 5,
        appid: apiKey,
      },
    });

    // Normalizamos un poco la salida
    return response.data.map((c) => {
      const nombreLargo = [
        c.name,
        c.state || null,
        c.country || null,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        nombre: nombreLargo, // "Mazatlán, Sinaloa, MX"
        ciudad: c.name,
        estado: c.state || null,
        pais: c.country || null,
        lat: c.lat,
        lon: c.lon,
      };
    });
  }
}

module.exports = CityService;
