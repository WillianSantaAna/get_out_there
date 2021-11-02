const express = require("express");
const userTypeModel = require("../models/userTypeModel");
const router = express.Router();

/* GET users listing. */
router.get("/", async (req, res) => {
  const { status, result } = await userTypeModel.getAllUserTypes();

  res.status(status).send(result);
});

module.exports = router;
