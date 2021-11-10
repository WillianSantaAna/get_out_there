const pool = require("./connection");

module.exports.getTeams = async () => {
  try {
    const sql = 'select te_id, te_name, te_description from teams where te_open is true';

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
    const sql = 'select te_id, te_name, te_description, te_admin_id, usr_name from teams t left join teams_users on te_id = tsr_tea_id left join users on te_admin_id = usr_id and tsr_usr_id = usr_id where te_open is true and te_id = $1'

    let result = await pool.query(sql, [id]);

    if (result.rowCount > 0) {
      result = result.rows[0];
      return { status: 200, result };
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

    const sql = 'insert into teams (te_name, te_description, te_admin_id) values ($1, $2, $3) returning te_id'

    let result = await pool.query(sql, [name, description, adminId]);

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

    const sql = 'insert into team_invitations (inv_te_id, inv_code) values ($1, $2) returning inv_id, inv_code';

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

    const queryFindInvitationCode = 'select inv_id, inv_te_id, inv_active from team_invitations where inv_code = $1';
    const queryDeactivateCode = 'update team_invitations set inv_active = false where inv_id = $1';
    const queryInsertMember = 'insert into teams_users (tsr_tea_id, tsr_usr_id) values ($1, $2) returning tsr_id';

    let invitationResult = await pool.query(queryFindInvitationCode, [invitationCode]);

    if (invitationResult.rowCount > 0) {
      let { inv_id, inv_te_id, inv_active } = invitationResult.rows[0];

      if (inv_active) {

        let deactivateCodeResult = await pool.query(queryDeactivateCode, [inv_id]);
        
        if (deactivateCodeResult.rowCount > 0) {
          let result = await pool.query(queryInsertMember, [inv_te_id, userId]);

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

module.exports.kickMember = async (memberId, team) => {
  try {
    const sql = 'delete from teams_users where tsr_tea_id = $1 and tsr_usr_id = $2';

    let result = await pool.query(sql, [team.teamId, memberId]);
    
    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
}

