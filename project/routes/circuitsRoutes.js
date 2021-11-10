const express = require("express");
const circuitModel = require("../models/circuitModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await circuitModel.getAllCircuits();

  res.status(status).send(result);
});

router.post("/", async (req, res) => {
  const circuit = req.body;
  const { status, result } = await circuitModel.addCircuit(circuit);

  res.status(status).send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await circuitModel.getCircuit(id);

  res.status(status).send(result);
});

module.exports = router;
