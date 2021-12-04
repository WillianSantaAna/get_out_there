const pool = require("./connection");
const circuitsModel = require("./circuitModel");

module.exports.getTeams = async () => {
  try {
    const sql = 'select tea_id, tea_name, tea_description from teams where tea_open is true';

    let result = await pool.query(sql);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.getTeam = async (id) => {
  try {
    const sql = `select tea_id, tea_name, tea_description, tea_score, tea_admin_id, usr_name as tea_admin from teams t
    inner join users on tea_admin_id = usr_id where tea_open is true and tea_id = $1`
    id = parseInt(id);

    if (typeof id === 'number' && !isNaN(id)) {
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
}

module.exports.getTeamMembers = async (id) => {
  try {
    const sql = `select tme_id, usr_name, usr_score from team_members inner join users on tme_usr_id = usr_id
    where tme_tea_id = $1 and tme_active = true`

    let result = await pool.query(sql, [id]);

    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.getTeamCircuits = async (id) => {
  try {
    const sql = 'select * from circuits where cir_id in (select distinct tci_cir_id from team_circuits where tci_tea_id = $1);';

    let result = await pool.query(sql, [id]);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.getTeamSchedules = async (id) => {
  try {
    const sql = 'select tci_id, cir_name from team_circuits inner join circuits on tci_cir_id = cir_id where tci_tea_id = $1 and tci_completed = false and tci_date >= current_date;';

    let result = await pool.query(sql, [id]);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.getTeamSchedule = async (id, scheduleId) => {
  try {
    const sql = 'select tc.*, c.* from team_circuits tc inner join circuits c on tci_cir_id = cir_id where tci_id = $1 and tci_completed = false and tci_date >= current_date';

    let result = await pool.query(sql, [scheduleId]);
    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.addTeam = async (team) => {
  try {
    const { name, description, adminId } = team;

    if (name === '') {
      return { status: 400, result: "Team name can't be empty" };
    } else if (description === '') {
      return { status: 400, result: "Team description can't be empty" };
    } else if (isNaN(adminId)) {
      return { status: 400, result: "Invalid administrator ID" };
    }

    const sql = 'insert into teams (tea_name, tea_description, tea_admin_id) values ($1, $2, $3) returning tea_id'

    let result = await pool.query(sql, [name, description, adminId]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.addTeamCircuit = async (teamId, circuit) => {
  try {
    const { name, coords, date } = circuit;

    const circuitId = await circuitsModel.addCircuit({name, coords});
    
    const sql = `insert into team_circuits (tci_cir_id, tci_tea_id, tci_date) values ($1, $2, $3)`;

    let result = await pool.query(sql, [circuitId.result.cir_id, teamId, date]);

    result = result.rows[0];

    return { status: 200, result: { msg: "Circuit created" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.updateCircuit = async (id, circuitId, circuit) => {
  try {
    const { name, date, active} = circuit;
    let eventDate = new Date(date).valueOf();

    const sql = 'update team_circuits set tc_name = $1, tc_event_date = $2, tc_active = $3 where tc_id = $4';

    let result = await pool.query(sql, [name, eventDate, active, circuitId]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.addInvite = async (team) => {
  try {
    const teamId = team.teamId;
    const invitationCode = `#${new Date().valueOf().toString(22).toUpperCase()}`

    if (isNaN(teamId)) {
      return { status: 400, result: "Invalid Team ID" };
    }

    const sql = 'insert into invitations (inv_tea_id, inv_code) values ($1, $2) returning inv_id, inv_code';

    let result = await pool.query(sql, [teamId, invitationCode]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.joinTeam = async (userId, invitationCode) => {
  try {
    if (isNaN(userId)) return { status: 400, result: "Invalid user" };
    else if (invitationCode.length !== 11) return { status: 400, result: "Invalid invitation code" };

    const queryFindInvitationCode = 'select inv_id, inv_tea_id, inv_active from invitations where inv_code = $1';
    const queryDeactivateCode = 'update invitations set inv_active = false where inv_id = $1';
    const queryInsertMember = 'insert into team_members (tme_tea_id, tme_usr_id) values ($1, $2) returning tme_tea_id as tea_id';

    let invitationResult = await pool.query(queryFindInvitationCode, [invitationCode]);

    if (invitationResult.rowCount > 0) {
      let { inv_id, inv_tea_id, inv_active } = invitationResult.rows[0];

      if (inv_active) {

        let deactivateCodeResult = await pool.query(queryDeactivateCode, [inv_id]);
        
        if (deactivateCodeResult.rowCount > 0) {
          let result = await pool.query(queryInsertMember, [inv_tea_id, userId]);

          result = result.rows[0];

          return { status: 200, result };
        } else {
          return { status: 400, result: deactivateCodeResult };
        }
      } else {
        return { status: 404, result: "Invitation code is already used" };
      }
    } else {
      return { status: 404, result: `Invite with code ${invitationCode} not found` };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

module.exports.kickMember = async (id) => {
  try {
    const sql = 'update team_members set tme_active = false where tme_id = $1 and tme_active = true';

    let result = await pool.query(sql, [id]);
    
    if (result.rowCount > 0) {
      return { status: 200, result };
    } else {
      return { status: 404, result: `Member with team member id ${id} not found` };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

