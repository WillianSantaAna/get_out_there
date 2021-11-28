const express = require("express");
const teamModel = require("../models/teamModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await teamModel.getTeams();

  res.status(status).send(result);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await teamModel.getTeam(id);

  res.status(status).send(result);
});

router.get("/:id/members", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await teamModel.getTeamMembers(id);

  res.status(status).send(result);
});

router.get("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await teamModel.getCircuits(id);

  res.status(status).send(result);
});

router.post("/", async (req, res) => {
  const team = req.body;
  const { status, result } = await teamModel.addTeam(team);

  res.status(status).send(result);
});

router.post("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const circuit = req.body;
  const { status, result } = await teamModel.addCircuit(id, circuit);

  res.status(status).send(result);
});

router.post("/members/invite", async (req, res) => {
  const team = req.body;
  const { status, result } = await teamModel.addInvite(team);

  res.status(status).send(result);
});

router.post("/members/join", async (req, res) => {
  const { userId, invitationCode } = req.body;
  const { status, result } = await teamModel.joinTeam(userId, invitationCode);

  res.status(status).send(result);
});

router.put("/:id/circuits/:circuitId", async (req, res) => {
  const id = req.params.id;
  const circuitId = req.params.circuitId;
  const circuit = req.body;
  const { status, result } = await teamModel.updateCircuit(id, circuitId, circuit);

  res.status(status).send(result);
});

router.put("/:id/members/kick", async (req, res) => {
  const teamMemberId = req.body.tmeId;
  const { status, result } = await teamModel.kickMember(teamMemberId);

  res.status(status).send(result);
});

module.exports = router;