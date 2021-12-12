const pool = require("./connection");
const circuitsModel = require("./circuitModel");

module.exports.getTeams = async () => {
  try {
    const sql =
      "select tea_id, tea_name, tea_description from teams where tea_open is true";

    let result = await pool.query(sql);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeamsLeaderboard = async (count = 10, page = 0) => {
  try {
    const count_sql = `SELECT COUNT(*) AS total_count FROM teams;`;
    const teams_sql = `SELECT tea_id, tea_name, tea_score
	      FROM teams
	      ORDER BY tea_score DESC
		    LIMIT $1
		    OFFSET $2;`;

    let count_result = await pool.query(count_sql);
    let teams_result = await pool.query(teams_sql, [count, count * page]);

    const result = {
      totalCount: count_result.rows[0].total_count,
      teams: teams_result.rows,
      totalPages: Math.ceil(count_result.rows[0].total_count / count),
      currentPage: parseInt(page),
    };

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeam = async (id) => {
  try {
    const sql = `select tea_id, tea_name, tea_description, tea_score from teams t
      where tea_open is true and tea_id = $1`;
    id = parseInt(id);

    if (typeof id === "number" && !isNaN(id)) {
      let result = await pool.query(sql, [id]);

      if (result.rowCount > 0) {
        result = result.rows[0];

        return { status: 200, result };
      }
    }

    return {
      status: 404,
      result: { msg: `Team with id ${id} not found` },
    };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeamMembers = async (id) => {
  try {
    const sql = `select tme_id, tme_usr_id, tme_is_admin, usr_name, usr_score from team_members inner join users on tme_usr_id = usr_id
      where tme_tea_id = $1 and tme_active = true`;

    let result = await pool.query(sql, [id]);

    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeamCircuits = async (id) => {
  try {
    const sql =
      "select * from circuits where cir_id in (select distinct tci_cir_id from team_circuits where tci_tea_id = $1 and tci_active = true);";

    let result = await pool.query(sql, [id]);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeamSchedules = async (id) => {
  try {
    const sql =
      "select tci_id, cir_name, tci_date from team_circuits inner join circuits on tci_cir_id = cir_id where tci_tea_id = $1 and tci_completed = false and tci_active = true and tci_date >= current_date;";

    let result = await pool.query(sql, [id]);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getTeamSchedule = async (id, scheduleId) => {
  try {
    const sql =
      "select tc.*, c.* from team_circuits tc inner join circuits c on tci_cir_id = cir_id where tci_id = $1 and tci_completed = false and tci_date >= current_date";

    let result = await pool.query(sql, [scheduleId]);

    if (result.rowCount > 0) {
      result = result.rows[0];

      return { status: 200, result };
    }

    return {
      status: 404,
      result: { msg: `Team Schedule with id ${scheduleId} not found` },
    };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addTeam = async (team) => {
  try {
    const { name, description, userId } = team;

    if (name === "") {
      return { status: 400, result: "Team name can't be empty" };
    } else if (description === "") {
      return { status: 400, result: "Team description can't be empty" };
    } else if (isNaN(userId)) {
      return { status: 400, result: "Invalid administrator ID" };
    }

    const sql = "call create_team ($1, $2, $3)";

    let result = await pool.query(sql, [name, description, userId]);

    if (result.rows.length > 0) {
      result = result.rows[0];

      return { status: 200, result };
    } else {
      return { status: 400, result: { msg: "Bad request" } };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addTeamScore = async (teamId, distance) => {
  try {
    let score = Math.round(distance);

    if (distance >= 10) {
      score = Math.round(distance * 1.2);
    }

    const sql =
      "UPDATE teams SET tea_score = tea_score + $1 WHERE tea_id = $2 RETURNING tea_score";

    let result = await pool.query(sql, [score, teamId]);

    if (result.rowCount <= 0) {
      return { status: 400, result: { msg: "Wrong teamId" } };
    }

    result = result.rows[0];

    return { status: 200, result: { received_score: score, ...result } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addTeamCircuit = async (teamId, circuit) => {
  try {
    const { name, coords, date } = circuit;

    const circuitId = await circuitsModel.addCircuit({ name, coords });

    const sql = `insert into team_circuits (tci_cir_id, tci_tea_id, tci_date) values ($1, $2, $3)`;

    let result = await pool.query(sql, [circuitId.result.cir_id, teamId, date]);

    result = result.rows[0];

    return { status: 200, result: { msg: "Circuit created" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.removeTeamCircuit = async (teamId, circuitId) => {
  try {
    const sql =
      "UPDATE team_circuits SET tci_active = false WHERE tci_tea_id = $1 AND tci_cir_id = $2";

    let result = await pool.query(sql, [teamId, circuitId]);

    return { status: 200, result: { msg: "Circuit removed" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.updateCircuit = async (id, circuitId, circuit) => {
  try {
    const { name, date, active } = circuit;
    let eventDate = new Date(date).valueOf();

    const sql =
      "update team_circuits set tc_name = $1, tc_event_date = $2, tc_active = $3 where tc_id = $4";

    let result = await pool.query(sql, [name, eventDate, active, circuitId]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addInvite = async (team) => {
  try {
    const teamId = team.teamId;
    const invitationCode = `#${new Date()
      .valueOf()
      .toString(22)
      .toUpperCase()}`;

    if (isNaN(teamId)) {
      return { status: 400, result: "Invalid Team ID" };
    }

    const sql =
      "insert into invitations (inv_tea_id, inv_code) values ($1, $2) returning inv_id, inv_code";

    let result = await pool.query(sql, [teamId, invitationCode]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.joinTeam = async (userId, invitationCode) => {
  try {
    if (isNaN(userId)) return { status: 400, result: "Invalid user" };
    else if (invitationCode.length !== 11)
      return { status: 400, result: "Invalid invitation code" };

    const queryFindInvitationCode =
      "select inv_id, inv_tea_id, inv_active from invitations where inv_code = $1";
    const queryDeactivateCode =
      "update invitations set inv_active = false where inv_id = $1";
    const queryInsertMember =
      "insert into team_members (tme_tea_id, tme_usr_id) values ($1, $2) returning tme_tea_id as tea_id";

    let invitationResult = await pool.query(queryFindInvitationCode, [
      invitationCode,
    ]);

    if (invitationResult.rowCount > 0) {
      let { inv_id, inv_tea_id, inv_active } = invitationResult.rows[0];

      if (inv_active) {
        let deactivateCodeResult = await pool.query(queryDeactivateCode, [
          inv_id,
        ]);

        if (deactivateCodeResult.rowCount > 0) {
          let result = await pool.query(queryInsertMember, [
            inv_tea_id,
            userId,
          ]);

          result = result.rows[0];

          return { status: 200, result };
        } else {
          return { status: 400, result: deactivateCodeResult };
        }
      } else {
        return { status: 404, result: {msg: "Invitation code is already used"} };
      }
    } else {
      return {
        status: 404,
        result: {msg: `Invite with code ${invitationCode} not found`},
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.promoteMember = async (teamId, data) => {
  try {
    const { adminId, teamMemberId } = data;
    const sql =
      "update team_members set tme_is_admin = true where tme_id = $1 and tme_active = true and tme_tea_id in (select tme_tea_id from team_members where tme_tea_id = $2 and tme_usr_id = $3 and tme_is_admin = true and tme_active = true)";

    let result = await pool.query(sql, [teamMemberId, teamId, adminId]);

    if (result.rowCount > 0) {
      return { status: 200, result };
    } else {
      return {
        status: 404,
        result: {msg:`Member with team member id ${id} not found`},
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.kickMember = async (id) => {
  try {
    const sql =
      "update team_members set tme_active = false where tme_id = $1 and tme_active = true";

    let result = await pool.query(sql, [id]);

    if (result.rowCount > 0) {
      return { status: 200, result };
    } else {
      return {
        status: 404,
        result: {msg:`Member with team member id ${id} not found`},
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};
