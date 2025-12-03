// js/app.js
import { fetchWeatherByCity, fetchForecastByCity } from "./api/weatherApi.js";
import { searchCities } from "./api/cityApi.js";
import {
  formatWeatherData,
  formatFechaHora,
  formatDailyForecast,
} from "./services/weatherService.js";
import {
  showWeather,
  showError,
  renderForecastDays,
  renderMainChart,
  setActiveChartTab,
} from "./ui/weatherUI.js";

const form = document.getElementById("form-clima");
const ciudadInput = document.getElementById("ciudad");
const btnClear = document.getElementById("btn-clear");

const tabTemp = document.getElementById("tab-temp");
const tabPrec = document.getElementById("tab-prec");
const tabViento = document.getElementById("tab-viento");

const sugerenciasEl = document.getElementById("ciudad-sugerencias");

// Estado sencillo en el front
let ultimoForecastDias = [];
let sugerencias = [];
let sugerenciaSeleccionada = -1;
let debounceTimer = null;

// 🔥 Función principal que busca clima + pronóstico
async function buscarCiudad(ciudad) {
  if (!ciudad) return;

  try {
    const [rawCurrent, rawForecast] = await Promise.all([
      fetchWeatherByCity(ciudad),
      fetchForecastByCity(ciudad),
    ]);

    // Clima actual
    const formatted = formatWeatherData(rawCurrent);
    const fechaStr = formatFechaHora(formatted.fechaHora);
    showWeather(formatted, fechaStr);

    // Pronóstico (array de días)
    const dias = formatDailyForecast(rawForecast);
    ultimoForecastDias = dias;

    // Tarjetitas de abajo
    renderForecastDays(dias);

    // Probabilidad de precipitaciones (día actual)
    if (dias.length > 0) {
      const p = dias[0].lluviaProb ?? 0;
      document.getElementById("precipitacion").textContent = p === 0 ? "—" : p;
    }

    // Gráfica principal: por defecto, temperatura
    setActiveChartTab("temp");
    renderMainChart("temp", ultimoForecastDias);
  } catch (err) {
    console.error(err);
    showError(err.message || "No se pudo obtener el clima. Intenta de nuevo.");
  }
}

// ---------- AUTOCOMPLETE CIUDADES ----------

function renderSugerencias() {
  if (!sugerenciasEl) return;

  if (!sugerencias || sugerencias.length === 0) {
    sugerenciasEl.classList.add("hidden");
    sugerenciasEl.innerHTML = "";
    sugerenciaSeleccionada = -1;
    return;
  }

  sugerenciasEl.innerHTML = sugerencias
    .map(
      (c, idx) => `
      <li
        data-idx="${idx}"
        class="px-4 py-2 cursor-pointer ${
          idx === sugerenciaSeleccionada ? "bg-gray-100" : "hover:bg-gray-100"
        }"
      >
        ${c.nombre}
      </li>
    `
    )
    .join("");

  sugerenciasEl.classList.remove("hidden");
}

function limpiarSugerencias() {
  sugerencias = [];
  sugerenciaSeleccionada = -1;
  if (sugerenciasEl) {
    sugerenciasEl.innerHTML = "";
    sugerenciasEl.classList.add("hidden");
  }
}

// cuando el usuario escribe en el input
ciudadInput.addEventListener("input", (e) => {
  const q = e.target.value.trim();

  if (debounceTimer) clearTimeout(debounceTimer);

  if (q.length < 2) {
    limpiarSugerencias();
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const results = await searchCities(q);
      sugerencias = results;
      sugerenciaSeleccionada = -1;
      renderSugerencias();
    } catch (error) {
      console.error(error);
      limpiarSugerencias();
    }
  }, 300);
});

// click sobre una sugerencia
sugerenciasEl.addEventListener("click", (e) => {
  const li = e.target.closest("li[data-idx]");
  if (!li) return;
  const idx = Number(li.dataset.idx);
  const sel = sugerencias[idx];
  if (!sel) return;

  ciudadInput.value = sel.nombre;
  limpiarSugerencias();
  buscarCiudad(sel.nombre);
});

// navegación con teclado (flechas + enter + escape)
ciudadInput.addEventListener("keydown", (e) => {
  if (!sugerencias || sugerencias.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    sugerenciaSeleccionada =
      (sugerenciaSeleccionada + 1) % sugerencias.length;
    renderSugerencias();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    sugerenciaSeleccionada =
      (sugerenciaSeleccionada - 1 + sugerencias.length) %
      sugerencias.length;
    renderSugerencias();
  } else if (e.key === "Enter") {
    if (sugerenciaSeleccionada >= 0) {
      e.preventDefault();
      const sel = sugerencias[sugerenciaSeleccionada];
      ciudadInput.value = sel.nombre;
      limpiarSugerencias();
      buscarCiudad(sel.nombre);
    }
  } else if (e.key === "Escape") {
    limpiarSugerencias();
  }
});

// al perder foco, ocultamos sugerencias (pero dejamos tiempo para que haga click)
ciudadInput.addEventListener("blur", () => {
  setTimeout(limpiarSugerencias, 200);
});

// ---------- FORM, TABS Y CARGA INICIAL ----------

// Buscar al enviar el formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ciudad = ciudadInput.value.trim();
  limpiarSugerencias();
  buscarCiudad(ciudad);
});

// Botón limpiar
btnClear.addEventListener("click", () => {
  ciudadInput.value = "";
  ciudadInput.focus();
  limpiarSugerencias();
});

// Tabs: cambiar gráfica al hacer click
tabTemp.addEventListener("click", () => {
  setActiveChartTab("temp");
  renderMainChart("temp", ultimoForecastDias);
});

tabPrec.addEventListener("click", () => {
  setActiveChartTab("prec");
  renderMainChart("prec", ultimoForecastDias);
});

tabViento.addEventListener("click", () => {
  setActiveChartTab("viento");
  renderMainChart("viento", ultimoForecastDias);
});

// Búsqueda inicial automática
document.addEventListener("DOMContentLoaded", () => {
  const ciudadInicial = ciudadInput.value.trim() || "Mazatlan";
  buscarCiudad(ciudadInicial);
});
