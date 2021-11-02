const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await userModel.getAllUsers();

  res.status(status).send(result);
});

router.post("/", async (req, res) => {
  const user = req.body;
  const { status, result } = await userModel.addUser(user);

  res.status(status).send(result);
});

router.post("/login", async (req, res) => {
  const user = req.body;
  const { status, result } = await userModel.login(user);

  res.status(status).send(result);
});

module.exports = router;
