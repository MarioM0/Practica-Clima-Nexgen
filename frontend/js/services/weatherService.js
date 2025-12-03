// js/services/weatherService.js
export function formatWeatherData(raw) {
  return {
    ciudad: raw.ciudad,
    temperatura: Math.round(raw.temperatura),
    descripcion: raw.descripcion,
    humedad: raw.humedad,
    viento: raw.viento ? Math.round(raw.viento) : null, // km/h
    icono: raw.icono,   
    fuente: raw.fuente || "OpenWeather",
    fechaHora: new Date(),
  };
}

export function formatFechaHora(fecha) {
  return fecha.toLocaleString("es-MX", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDailyForecast(rawDias) {
  return rawDias.map((dia) => ({
    diaSemana: dia.diaSemana,      // viene ya formateado del backend (ej. "mar.")
    tempMax: dia.tempMax,
    tempMin: dia.tempMin,
    icono: dia.icono,
    descripcion: dia.descripcion,
    lluviaProb: dia.lluviaProb ?? 0, 
    viento: dia.viento ?? 0,         
  }));
}
