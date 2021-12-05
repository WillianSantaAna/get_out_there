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
  const { status, result } = await teamModel.getTeamCircuits(id);

  res.status(status).send(result);
});

router.get("/:id/schedules", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await teamModel.getTeamSchedules(id);

  res.status(status).send(result);
});

router.get("/:id/schedules/:scheduleId", async (req, res) => {
  const id = req.params.id;
  const scheduleId = req.params.scheduleId;
  const { status, result } = await teamModel.getTeamSchedule(id, scheduleId);

  res.status(status).send(result);
});

router.post("/", async (req, res) => {
  const team = req.body;
  const { status, result } = await teamModel.addTeam(team);

  res.status(status).send(result);
});

router.put("/:id/score", async (req, res) => {
  const id = req.params.id;
  const { distance } = req.body;
  const { status, result } = await teamModel.addTeamScore(id, distance);

  res.status(status).send(result);
});

router.post("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const circuit = req.body;
  const { status, result } = await teamModel.addTeamCircuit(id, circuit);

  res.status(status).send(result);
});

router.delete("/:teamId/circuits/:circuitId", async (req, res) => {
  const { teamId, circuitId } = req.params;
  const { status, result } = await teamModel.removeTeamCircuit(
    teamId,
    circuitId
  );

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
  const { status, result } = await teamModel.updateCircuit(
    id,
    circuitId,
    circuit
  );

  res.status(status).send(result);
});

router.put("/:id/members/kick", async (req, res) => {
  const teamMemberId = req.body.tmeId;
  const { status, result } = await teamModel.kickMember(teamMemberId);

  res.status(status).send(result);
});

module.exports = router;
