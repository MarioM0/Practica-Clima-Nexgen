// js/ui/weatherUI.js

const errorMsg = document.getElementById("error");

const tempEl = document.getElementById("temp");
const precEl = document.getElementById("precipitacion");
const humEl = document.getElementById("humedad");
const vientoEl = document.getElementById("viento");

const ciudadTituloEl = document.getElementById("ciudad-titulo");
const fechaHoraEl = document.getElementById("fecha-hora");
const descripcionEl = document.getElementById("descripcion");

const iconContainer = document.getElementById("icon-container");
const diasContainer = document.getElementById("dias-container");

const cardEl = document.getElementById("card-clima");
const bodyEl = document.body;

const chartContainer = document.getElementById("chart-container");
const tabTemp = document.getElementById("tab-temp");
const tabPrec = document.getElementById("tab-prec");
const tabViento = document.getElementById("tab-viento");


// clases de fondo que podemos ir cambiando
const BODY_BG_THEMES = ["bg-gray-100", "bg-yellow-100", "bg-blue-100", "bg-slate-200"];
const CARD_BG_THEMES = [
  "bg-white",
  "bg-yellow-50",
  "bg-blue-50",
  "bg-slate-50",
  "border-gray-200",
  "border-yellow-200",
  "border-blue-200",
  "border-slate-200",
];

export function showWeather(data, fechaHoraFormateada) {
  errorMsg.classList.add("hidden");
  errorMsg.textContent = "";

  tempEl.textContent = data.temperatura ?? "--";
  humEl.textContent = data.humedad ?? "--";
  vientoEl.textContent = data.viento ?? "--";
  precEl.textContent = "-"; // de momento no tenemos prob. de lluvia real

  ciudadTituloEl.textContent = data.ciudad || "Clima";
  fechaHoraEl.textContent = fechaHoraFormateada || "--";
  descripcionEl.textContent =
    (data.descripcion && capitalize(data.descripcion)) || "--";

  // --- icono dinámico principal ---
  if (data.icono && iconContainer) {
    const url = `https://openweathermap.org/img/wn/${data.icono}@2x.png`;
    iconContainer.innerHTML = `<img src="${url}" alt="icono-clima" class="w-20 h-20">`;
  }

  // 🌈 aplicar tema global según el clima actual
  applyWeatherTheme(data);
}

export function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🎨 Helper: clases para cada tarjeta según su propio icono
function getForecastCardClasses(iconCode) {
  const code = (iconCode || "").slice(0, 2); // "01", "02", "09", etc.

  switch (code) {
    case "01":
      // soleado
      return "bg-yellow-50 border-yellow-200";

    case "02":
    case "03":
    case "04":
      // nublado
      return "bg-slate-50 border-slate-200";

    case "09":
    case "10":
      // lluvia
      return "bg-blue-50 border-blue-200";

    default:
      // por defecto
      return "bg-gray-50 border-gray-100";
  }
}

// 🔮 Tarjetitas del pronóstico: cada una según SU clima
export function renderForecastDays(dias) {
  if (!diasContainer) return;

  diasContainer.innerHTML = dias
    .map((dia) => {
      const iconUrl = dia.icono
        ? `https://openweathermap.org/img/wn/${dia.icono}.png`
        : null;

      const cardBgClasses = getForecastCardClasses(dia.icono);

      return `
        <div class="flex flex-col items-center rounded-xl p-2 pb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${cardBgClasses}">
          <span class="text-sm font-medium text-gray-700 mb-2">${dia.diaSemana}</span>
          <div class="w-8 h-8 mb-2 flex items-center justify-center">
            ${
              iconUrl
                ? `<img src="${iconUrl}" alt="${dia.descripcion}" class="w-8 h-8" />`
                : `<span class="text-gray-300 text-lg">-</span>`
            }
          </div>
          <div class="text-sm">
            <span class="text-gray-800 font-bold">${dia.tempMax}°</span>
            <span class="text-gray-400 ml-1">${dia.tempMin}°</span>
          </div>
        </div>
      `;
    })
    .join("");
}

// ----- Tema global (body + card principal) -----

function getWeatherCondition(data) {
  const icon = data.icono || "";
  const code = icon.slice(0, 2); // "01", "02", "09", etc.

  switch (code) {
    case "01":
      return "clear";   // cielo despejado
    case "02":
    case "03":
    case "04":
      return "clouds";  // nublado / muy nuboso
    case "09":
    case "10":
      return "rain";    // lluvia
    case "11":
      return "storm";   // tormenta
    case "13":
      return "snow";
    default:
      return "default";
  }
}

function applyWeatherTheme(data) {
  if (!bodyEl || !cardEl) return;

  console.log(
    "🌈 applyWeatherTheme() ejecutado",
    "icono:", data.icono,
    "condición:", getWeatherCondition(data)
  );

  // 1. limpiar temas anteriores
  bodyEl.classList.remove(...BODY_BG_THEMES);
  cardEl.classList.remove(...CARD_BG_THEMES);

  const condition = getWeatherCondition(data);

  // 2. aplicar según el tipo de clima
  switch (condition) {
    case "clear":
      bodyEl.classList.add("bg-yellow-100");
      cardEl.classList.add("bg-yellow-50", "border-yellow-200");
      break;

    case "rain":
      bodyEl.classList.add("bg-blue-100");
      cardEl.classList.add("bg-blue-50", "border-blue-200");
      break;

    case "clouds":
      bodyEl.classList.add("bg-slate-200");
      cardEl.classList.add("bg-slate-50", "border-slate-200");
      break;

    case "storm":
      bodyEl.classList.add("bg-blue-100");
      cardEl.classList.add("bg-slate-50", "border-slate-200");
      break;

    default:
      bodyEl.classList.add("bg-gray-100");
      cardEl.classList.add("bg-white", "border-gray-200");
      break;
  }
}

export function setActiveChartTab(tipo) {
  const activeClasses = "border-b-[3px] border-yellow-400 text-gray-800 font-bold";
  const inactiveClasses = "border-b-[3px] border-transparent text-gray-500 hover:text-gray-700";

  function setTab(tabEl, isActive) {
    if (!tabEl) return;
    tabEl.className = tabEl.className // limpiamos las clases base de Tailwind pero dejando el layout
      .replace(/border-b-\[3px\].*$/g, "") // no perfecto, pero suficiente
      .trim();
    if (isActive) {
      tabEl.classList.add(...activeClasses.split(" "));
    } else {
      tabEl.classList.add(...inactiveClasses.split(" "));
    }
  }

  setTab(tabTemp, tipo === "temp");
  setTab(tabPrec, tipo === "prec");
  setTab(tabViento, tipo === "viento");
}


// ----- GRÁFICAS PRINCIPALES (temperatura / precipitación / viento) -----

export function renderMainChart(tipo, dias) {
  if (!chartContainer || !dias || dias.length === 0) return;

  // Elegir qué valor graficar
  const values = dias.map((d) => {
    if (tipo === "temp") return d.tempMax ?? 0;
    if (tipo === "prec") return d.lluviaProb ?? 0;   // porcentaje
    if (tipo === "viento") return d.viento ?? 0;     // km/h
    return 0;
  });

  const labels = dias.map((d) => d.diaSemana || "");

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Evitar división por 0
  const range = max - min || 1;

  // Generar puntos para polyline (en coordenadas 0-100)
  const points = values
    .map((val, idx) => {
      const x = (idx / Math.max(values.length - 1, 1)) * 100;
      // invertimos el eje Y (SVG empieza arriba) y dejamos margen
      const norm = (val - min) / range; // 0 a 1
      const y = 90 - norm * 70; // margen 10 arriba y 10 abajo
      return `${x},${y}`;
    })
    .join(" ");

  // Color según tipo de gráfica
  let strokeColor = "#facc15"; // amarillo (temp)
  if (tipo === "prec") strokeColor = "#38bdf8";   // azul
  if (tipo === "viento") strokeColor = "#a855f7"; // morado

  chartContainer.innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
         class="absolute inset-0 w-full h-full">
      <!-- línea -->
      <polyline
        fill="none"
        stroke="${strokeColor}"
        stroke-width="2"
        points="${points}"
      />
      <!-- puntos -->
      ${values
        .map((val, idx) => {
          const x = (idx / Math.max(values.length - 1, 1)) * 100;
          const norm = (val - min) / range;
          const y = 90 - norm * 70;
          return `<circle cx="${x}" cy="${y}" r="1.2" fill="${strokeColor}" />`;
        })
        .join("")}
    </svg>

    <!-- labels abajo -->
    <div class="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 px-2 font-medium">
      ${labels
        .map(
          (lbl, idx) => `
        <div class="w-12 text-center">
          <div>${lbl}</div>
          <div class="text-[10px] text-gray-400">${values[idx]}${
            tipo === "temp" ? "°" : tipo === "prec" ? "%" : " km/h"
          }</div>
        </div>
      `
        )
        .join("")}
    </div>
  `;


  
}
