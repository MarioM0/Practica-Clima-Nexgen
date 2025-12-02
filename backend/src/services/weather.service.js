// src/services/weather.service.js
const axios = require("axios");
const Weather = require("../models/weather"); // 👈 mejor con la W mayúscula

const apiKey = process.env.OPENWEATHER_API_KEY;
const baseUrl =
  process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5";

// URL base para One Call 3.0 (PRONÓSTICO 7 DÍAS)
const oneCallUrl =
  process.env.OPENWEATHER_ONECALL_URL ||
  "https://api.openweathermap.org/data/3.0/onecall";

// SOLO PARA DEPURAR (luego lo puedes borrar)
console.log(
  "🔑 API key (parcial):",
  apiKey ? apiKey.slice(0, 4) + "... (oculta)" : "NO DEFINIDA"
);
console.log("🌍 Base URL:", baseUrl);
console.log("📡 OneCall URL:", oneCallUrl);

class WeatherService {
  // ======================
  //  CLIMA ACTUAL POR CIUDAD
  // ======================
  static async getWeatherByCity(ciudad) {
    if (!apiKey) {
      throw new Error("Falta configurar OPENWEATHER_API_KEY en el archivo .env");
    }

    try {
      const response = await axios.get(`${baseUrl}/weather`, {
        params: {
          q: ciudad,
          appid: apiKey,
          units: "metric", // Celsius
          lang: "es",      // Respuestas en español
        },
      });

      const data = response.data;

      const icono = data.weather?.[0]?.icon || null;

      // 🔹 viento viene en m/s -> lo pasamos a km/h
      const vientoMs = data.wind?.speed ?? null; // m/s
      const vientoKmh =
        vientoMs != null ? Math.round(vientoMs * 3.6) : null; // km/h

      // Normalizamos la respuesta al modelo Weather
      const weather = new Weather({
        ciudad: `${data.name}, ${data.sys?.country || ""}`.trim(),
        temperatura: data.main?.temp,
        descripcion: data.weather?.[0]?.description || "Sin descripción",
        humedad: data.main?.humidity,
        viento: vientoKmh,
        icono,
        fuente: "OpenWeather",
      });

      return weather;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const msg = error.response.data?.message || "Ciudad no encontrada";
        const err = new Error(`Ciudad no encontrada: ${ciudad} (${msg})`);
        err.statusCode = 404;
        throw err;
      }

      console.error("Error llamando a OpenWeather:", error.message);
      console.error("Respuesta de OpenWeather:", error.response?.data);
      throw new Error("Error al obtener datos del clima desde OpenWeather");
    }
  }

  // dentro de class WeatherService { ... }

  // ======================
  //  PRONÓSTICO (5 DÍAS) AGRUPADO POR DÍA
  // ======================
  static async get7DayForecastByCity(ciudad) {
    if (!apiKey) {
      throw new Error("Falta configurar OPENWEATHER_API_KEY en el archivo .env");
    }

    try {
      // Usamos /forecast (5 días, cada 3 horas)
      const forecastResp = await axios.get(`${baseUrl}/forecast`, {
        params: {
          q: ciudad,
          appid: apiKey,
          units: "metric",
          lang: "es",
        },
      });

      const forecastData = forecastResp.data;
      const lista = forecastData.list || [];

      // Agrupar por día (yyyy-mm-dd)
      const porDia = {};

      for (const punto of lista) {
        const fecha = new Date(punto.dt * 1000);
        const key = fecha.toISOString().slice(0, 10); // "2025-02-12"

        if (!porDia[key]) {
          porDia[key] = [];
        }
        porDia[key].push(punto);
      }

      // Convertir cada día en un objeto {diaSemana, tempMax, tempMin, icono, descripcion}
      const clavesDias = Object.keys(porDia).sort(); // ordenar por fecha asc

      const dias = clavesDias.slice(0, 7).map((key) => {
        const puntos = porDia[key];

        let tempMax = -Infinity;
        let tempMin = Infinity;

        for (const p of puntos) {
          const t = p.main?.temp;
          if (typeof t === "number") {
            if (t > tempMax) tempMax = t;
            if (t < tempMin) tempMin = t;
          }
        }

        // Tomamos como "representativo" un punto central del día
        const puntoCentral = puntos[Math.floor(puntos.length / 2)];
        const icono = puntoCentral.weather?.[0]?.icon || null;
        const descripcion = puntoCentral.weather?.[0]?.description || "";

        const fecha = new Date(puntos[0].dt * 1000);
        const diaSemana = fecha.toLocaleDateString("es-MX", {
          weekday: "short",
        });

        return {
          fecha: Math.floor(fecha.getTime() / 1000),
          diaSemana, // ej. "mié.", "jue."
          tempMax: Math.round(tempMax),
          tempMin: Math.round(tempMin),
          icono,
          descripcion,
        };
      });

      return dias;
    } catch (error) {
      console.error("Error en get7DayForecastByCity:", error.message);
      console.error("Respuesta de OpenWeather:", error.response?.data);

      if (error.response && error.response.status === 404) {
        const msg = error.response.data?.message || "Ciudad no encontrada";
        const err = new Error(`Ciudad no encontrada: ${ciudad} (${msg})`);
        err.statusCode = 404;
        throw err;
      }

      throw new Error(
        "Error al obtener el pronóstico de 7 días desde OpenWeather (vía /forecast)"
      );
    }
  }

// dentro de class WeatherService { ... }

  static async get7DayForecastByCity(ciudad) {
    if (!apiKey) {
      throw new Error("Falta configurar OPENWEATHER_API_KEY en el archivo .env");
    }

    try {
      // Usamos /forecast (5 días, cada 3 horas)
      const forecastResp = await axios.get(`${baseUrl}/forecast`, {
        params: {
          q: ciudad,
          appid: apiKey,
          units: "metric",
          lang: "es",
        },
      });

      const forecastData = forecastResp.data;
      const lista = forecastData.list || [];

      // Agrupar por día (yyyy-mm-dd)
      const porDia = {};

      for (const punto of lista) {
        const fecha = new Date(punto.dt * 1000);
        const key = fecha.toISOString().slice(0, 10); // "2025-02-12"

        if (!porDia[key]) {
          porDia[key] = [];
        }
        porDia[key].push(punto);
      }

      // Convertir cada día en un objeto {diaSemana, tempMax, tempMin, icono, descripcion, lluviaProb, viento}
      const clavesDias = Object.keys(porDia).sort(); // ordenar por fecha asc

      const dias = clavesDias.slice(0, 7).map((key) => {
        const puntos = porDia[key];

        let tempMax = -Infinity;
        let tempMin = Infinity;
        let sumPop = 0;     // suma de prob. de precipitación (0–1)
        let countPop = 0;
        let sumWind = 0;    // suma de viento (km/h)
        let countWind = 0;

        for (const p of puntos) {
          const t = p.main?.temp;
          if (typeof t === "number") {
            if (t > tempMax) tempMax = t;
            if (t < tempMin) tempMin = t;
          }

          // probabilidad de precipitación (0-1)
          if (typeof p.pop === "number") {
            sumPop += p.pop;
            countPop++;
          }

          // viento: m/s -> km/h
          const windMs = p.wind?.speed;
          if (typeof windMs === "number") {
            sumWind += windMs * 3.6;
            countWind++;
          }
        }

        const puntoCentral = puntos[Math.floor(puntos.length / 2)];
        const icono = puntoCentral.weather?.[0]?.icon || null;
        const descripcion = puntoCentral.weather?.[0]?.description || "";

        const fecha = new Date(puntos[0].dt * 1000);
        const diaSemana = fecha.toLocaleDateString("es-MX", {
          weekday: "short",
        });

        const lluviaProb = countPop ? Math.round((sumPop / countPop) * 100) : 0;
        const viento = countWind ? Math.round(sumWind / countWind) : 0;

        return {
          fecha: Math.floor(fecha.getTime() / 1000),
          diaSemana,         // ej. "mar", "mié"
          tempMax: Math.round(tempMax),
          tempMin: Math.round(tempMin),
          icono,
          descripcion,
          lluviaProb,        // 👈 porcentaje 0–100
          viento,            // 👈 km/h promedio del día
        };
      });

      return dias;
    } catch (error) {
      console.error("Error en get7DayForecastByCity:", error.message);
      console.error("Respuesta de OpenWeather:", error.response?.data);

      if (error.response && error.response.status === 404) {
        const msg = error.response.data?.message || "Ciudad no encontrada";
        const err = new Error(`Ciudad no encontrada: ${ciudad} (${msg})`);
        err.statusCode = 404;
        throw err;
      }

      throw new Error(
        "Error al obtener el pronóstico de 7 días desde OpenWeather (vía /forecast)"
      );
    }
  }

}

module.exports = WeatherService;
