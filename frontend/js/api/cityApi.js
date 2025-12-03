// js/api/cityApi.js

export async function searchCities(q) {
  if (!q || q.trim().length < 2) return [];

  const url = `http://localhost:3000/api/ciudades?q=${encodeURIComponent(q)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return [];
    }
    return resp.json();
  } catch (e) {
    console.error("Error buscando ciudades:", e);
    return [];
  }
}
