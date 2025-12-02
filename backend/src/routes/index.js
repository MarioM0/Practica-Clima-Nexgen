// src/routes/index.js
const express = require("express");
const weatherRoutes = require("./weather.routes");
const cityRoutes = require("./city.routes");

const router = express.Router();

router.use("/clima", weatherRoutes);
router.use("/ciudades", cityRoutes);

module.exports = router;
