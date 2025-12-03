class Weather {
  constructor({ ciudad, temperatura, descripcion, humedad, viento, icono, fuente }) {
    this.ciudad = ciudad;
    this.temperatura = temperatura;
    this.descripcion = descripcion;
    this.humedad = humedad;
    this.viento = viento;      // km/h
    this.icono = icono;
    this.fuente = fuente || "desconocida";
  }
}

module.exports = Weather;
