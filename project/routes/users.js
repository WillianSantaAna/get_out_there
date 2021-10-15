const express = require("express");
const pool = require("../models/connection");
const router = express.Router();

/* GET users listing. */
router.get("/", async (req, res, next) => {
  let users = [{ name: "John Doe", birthDate: "19/02/1999" }];
  let resp = await pool.query("SELECT NOW()");
  res.send(resp);
});

module.exports = router;
