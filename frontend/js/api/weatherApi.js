// js/api/weatherApi.js

export async function fetchWeatherByCity(ciudad) {
  const url = `http://localhost:3000/api/clima?ciudad=${encodeURIComponent(
    ciudad
  )}`;

  const resp = await fetch(url);

  if (!resp.ok) {
    const dataError = await resp.json().catch(() => ({}));
    throw new Error(dataError.message || "Error en la respuesta del servidor");
  }

  return resp.json();
}

export async function fetchForecastByCity(ciudad) {
  const url = `http://localhost:3000/api/clima/forecast?ciudad=${encodeURIComponent(
    ciudad
  )}`;

  const resp = await fetch(url);

  if (!resp.ok) {
    const dataError = await resp.json().catch(() => ({}));
    throw new Error(
      dataError.message || "Error en la respuesta del servidor (forecast)"
    );
  }

  return resp.json();
}
