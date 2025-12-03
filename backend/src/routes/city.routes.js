// src/routes/city.routes.js
const express = require("express");
const CityController = require("../controllers/city.controller");

const router = express.Router();

// GET /api/ciudades?q=Mazat
router.get("/", CityController.search);

module.exports = router;
