const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await userModel.getAllUsers();

  res.status(status).send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await userModel.getUser(id);

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

router.get("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await userModel.getUserCircuits(id);

  res.status(status).send(result);
});

router.get("/:id/solo-exercises", async (req, res) => {
  let id = req.params.id
  const { status, result } = await userModel.getUserSoloExercises(id);

  res.status(status).send(result);
});

router.get("/:id/team-exercises", async (req, res) => {
  let id = req.params.id
  const { status, result } = await userModel.getUserTeamExercises(id);

  res.status(status).send(result);
});

router.post("/:id/solo-exercises", async (req,res) => {
  let id = req.params.id
  let exr = req.body;
  const { status, result } = await userModel.addUserExercise(id, exr);

  res.status(status).send(result);
});

router.put("/:id/team/:teamId/leave", async (req, res) => {
  let id = req.params.id
  let teamId = req.params.teamId

  const { status, result } = await userModel.leaveTeam(id, teamId);

  res.status(status).send(result);
});


module.exports = router;
