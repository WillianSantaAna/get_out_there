const express = require("express");
const exerciseModel = require("../models/exerciseModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await exerciseModel.getAllExercises();

  res.status(status).send(result);
});

router.get("/types", async (req, res) => {
  const { status, result } = await exerciseModel.getExerciseTypes();

  res.status(status).send(result);
});

module.exports = router;