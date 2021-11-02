const express = require("express");
const countryModel = require("../models/countryModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await countryModel.getAllCountries();

  res.status(status).send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await countryModel.getCountry(id);

  res.status(status).send(result);
});

module.exports = router;
