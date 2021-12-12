const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

router.get("/", async (req, res) => {
  const { status, result } = await userModel.getAllUsers();

  res.status(status).send(result);
});

router.get("/leaderboard", async (req, res) => {
  const { page, count } = req.query;
  const { status, result } = await userModel.getUsersLeaderboard(count, page);

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

router.put("/:id/score", async (req, res) => {
  const id = req.params.id;
  const { distance } = req.body;
  const { status, result } = await userModel.addUserScore(id, distance);

  res.status(status).send(result);
});

router.get("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await userModel.getUserCircuits(id);

  res.status(status).send(result);
});

router.post("/:id/circuits", async (req, res) => {
  const id = req.params.id;
  const circuit = req.body;

  const { status, result } = await userModel.addUserCircuit(id, circuit);

  res.status(status).send(result);
});

router.delete("/:userId/circuits/:circuitId", async (req, res) => {
  const { userId, circuitId } = req.params;
  const { status, result } = await userModel.removeUserCircuit(
    userId,
    circuitId
  );

  res.status(status).send(result);
});

router.get("/:id/schedule", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await userModel.getScheduledCircuits(id);

  res.status(status).send(result);
});

router.get("/:userId/schedule/:scheduleId", async (req, res) => {
  const userId = req.params.userId;
  const scheduleId = req.params.scheduleId;
  const { status, result } = await userModel.getUserScheduledById(
    userId,
    scheduleId
  );

  res.status(status).send(result);
});

router.post("/:id/schedule", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const { status, result } = await userModel.scheduleUserCircuit(id, data);

  res.status(status).send(result);
});

router.put("/:uid/schedule/:sid", async (req, res) => {
  const uid = req.params.uid;
  const sid = req.params.sid;
  const data = req.body;
  const { status, result } = await userModel.rescheduleUserCircuit(
    uid,
    sid,
    data
  );

  res.status(status).send(result);
});

router.delete("/:uid/schedule/:sid", async (req, res) => {
  const uid = req.params.uid;
  const sid = req.params.sid;
  const { status, result } = await userModel.unscheduleUserCircuit(uid, sid);

  res.status(status).send(result);
});

router.put("/:userId/schedule/:scheduleId/complete", async (req, res) => {
  const userId = req.params.userId;
  const scheduleId = req.params.scheduleId;
  const { status, result } = await userModel.completeUserCircuit(
    userId,
    scheduleId
  );

  res.status(status).send(result);
});

router.get("/:id/calendar", async (req, res) => {
  const id = req.params.id;
  const { status, result } = await userModel.getScheduledCircuitsAsCalendarEvents(id);

  res.status(status).send(result);
});

router.put("/:id/team/:teamId/leave", async (req, res) => {
  let id = req.params.id;
  let teamId = req.params.teamId;

  const { status, result } = await userModel.leaveTeam(id, teamId);

  res.status(status).send(result);
});

module.exports = router;
