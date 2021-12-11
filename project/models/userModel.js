const pool = require("./connection");
const bcrypt = require("bcrypt");
const circuitsModel = require("./circuitModel");

const saltRounds = 10;

module.exports.getAllUsers = async () => {
  try {
    const sql = "SELECT * FROM users";
    let result = await pool.query(sql);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.getUsersLeaderboard = async (count = 10, page = 0) => {
  try {
    const count_sql = `SELECT COUNT(*) AS total_count FROM users;`;
    const users_sql = `SELECT usr.usr_id, usr.usr_name, usr.usr_score, tea.tea_name
	      FROM users AS usr
        LEFT JOIN team_members AS tme ON tme.tme_usr_id = usr.usr_id AND tme.tme_active = true
        LEFT JOIN teams AS tea ON tea.tea_id = tme.tme_tea_id
	      ORDER BY usr.usr_score DESC
		    LIMIT $1
		    OFFSET $2;`;

    let count_result = await pool.query(count_sql);
    let users_result = await pool.query(users_sql, [count, count * page]);

    const result = {
      totalCount: count_result.rows[0].total_count,
      users: users_result.rows,
      totalPages: Math.ceil(count_result.rows[0].total_count / count),
      currentPage: parseInt(page),
    };

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getUser = async (id) => {
  try {
    const sql = "SELECT * FROM users WHERE usr_id = $1";
    let result = await pool.query(sql, [id]);

    if (result.rowCount > 0) {
      result = result.rows[0];
      return { status: 200, result };
    }

    return {
      status: 404,
      result: { msg: `User with id ${id} not found` },
    };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.addUser = async (user) => {
  const { name, email, password } = user;
  const country = parseInt(user.country);

  if (typeof user !== "object") {
    return { status: 400, result: { msg: "Malformed data" } };
  }

  if (typeof name !== "string" || name.length < 3) {
    return { status: 400, result: { msg: "Invalid name" } };
  }

  if (typeof email !== "string" || email.length < 3) {
    return { status: 400, result: { msg: "Invalid email" } };
  }

  if (typeof password !== "string" || password.length < 6) {
    return { status: 400, result: { msg: "Invalid password" } };
  }

  if (typeof country !== "number" || country <= 0) {
    return { status: 400, result: { msg: "Invalid country id" } };
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const sql = `INSERT INTO users 
      (usr_name, usr_email, usr_password, usr_country_id)
      VALUES ($1, $2, $3, $4) RETURNING usr_id, usr_name`;
    let result = await pool.query(sql, [name, email, hash, country]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.login = async (user) => {
  try {
    const { email, password } = user;
    const sql = `SELECT usr.usr_id, usr.usr_name, usr.usr_password, tea.tea_id
    FROM users AS usr
    LEFT JOIN team_members AS tme ON usr.usr_id = tme.tme_usr_id AND tme.tme_active = true
    LEFT JOIN teams AS tea ON tme.tme_tea_id = tea.tea_id
    WHERE usr.usr_email = $1`;

    let result = await pool.query(sql, [email]);

    if (result.rowCount <= 0) {
      return { status: 400, result: { msg: "Wrong email" } };
    }

    result = result.rows[0];

    const match = await bcrypt.compare(password, result.usr_password);

    if (!match) {
      return { status: 400, result: { msg: "Wrong password" } };
    }

    delete result.usr_password;

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.addUserScore = async (userId, distance) => {
  try {
    let score = Math.round(distance);

    if (distance >= 10) {
      score = Math.round(distance * 1.2);
    }

    const sql =
      "UPDATE users SET usr_score = usr_score + $1 WHERE usr_id = $2 RETURNING usr_score";

    let result = await pool.query(sql, [score, userId]);

    if (result.rowCount <= 0) {
      return { status: 400, result: { msg: "Wrong userId" } };
    }

    result = result.rows[0];

    return { status: 200, result: { received_score: score, ...result } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getUserCircuits = async function (id) {
  try {
    const sql =
      "SELECT * FROM circuits WHERE cir_id in (SELECT DISTINCT uci_cir_id FROM user_circuits WHERE uci_usr_id = $1 AND uci_active = true);";
    let result = await pool.query(sql, [id]);

    result = result.rows;

    return { status: 200, result: result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addUserCircuit = async (userId, circuit) => {
  try {
    const circuitId = await circuitsModel.addCircuit(circuit);
    const sql = `INSERT INTO user_circuits (uci_cir_id, uci_usr_id, uci_date)
    VALUES ($1, $2, $3)`;

    const date = `1970-01-01 00:00:00`;

    let result = await pool.query(sql, [circuitId.result.cir_id, userId, date]);

    return { status: 200, result: { msg: "Circuit saved" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.removeUserCircuit = async (userId, circuitId) => {
  try {
    const sql =
      "UPDATE user_circuits SET uci_active = false WHERE uci_usr_id = $1 AND uci_cir_id = $2";

    let result = await pool.query(sql, [userId, circuitId]);

    return { status: 200, result: { msg: "Circuit removed" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getScheduledCircuits = async function (id) {
  try {
    const sql =
      "SELECT * FROM user_circuits WHERE uci_usr_id = $1 AND uci_completed = false AND uci_active = true AND uci_date >= NOW() - INTERVAL '1 DAY' ORDER BY uci_date ASC;";
    let result = await pool.query(sql, [id]);

    result = result.rows;

    return { status: 200, result: result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.getScheduledCircuitsAsCalendarEvents = async function (id) {
  try {
    const sql =
      "SELECT * FROM user_circuits WHERE uci_usr_id = $1 AND uci_completed = false AND uci_active = true AND uci_date >= NOW() - INTERVAL '1 DAY' ORDER BY uci_date ASC;";
    let result = await pool.query(sql, [id]);

    result = result.rows;
    let events = [];

    const circuits = await this.getUserCircuits(id);
    for (let uc of result) {
      const cir_name = circuits.result.filter(
        (c) => c.cir_id == uc.uci_cir_id
      )[0].cir_name;
      events.push({
        title: cir_name,
        start: uc.uci_date,
        id: uc.uci_id,
      });
    }

    return { status: 200, result: events };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.scheduleUserCircuit = async function (id, data) {
  let dt = new Date(data.datetime);
  if (dt > new Date()) {
    const dtformat = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:00`;
    const cid = parseInt(data.circuit_id);
    const uid = parseInt(id);

    if (typeof dtformat != "string") {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    if (typeof uid != "number" || uid <= 0) {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    if (typeof cid != "number" || cid <= 0) {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    try {
      const sql = `INSERT INTO user_circuits(uci_cir_id, uci_usr_id, uci_date) VALUES ($1, $2, timestamp '${dtformat}');`;
      let res = await pool.query(sql, [cid, uid]);
      result = res.rows[0];

      return { status: 200, result: result };
    } catch (error) {
      console.log(error);
      return { status: 500, result: error };
    }
  } else {
    return { status: 400, result: { msg: `cannot schedule circuit for a past date (${dt})`} };
  }
};

module.exports.rescheduleUserCircuit = async function (userId, scheduleId, data) {
  let dt = new Date(data.newdatetime);
  if (dt > new Date()) {

    const dtformat = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:00`;
    const uid = parseInt(userId);
    const sid = parseInt(scheduleId);

    if (typeof dtformat != "string") {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    if (typeof uid != "number" || uid <= 0) {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    if (typeof sid != "number" || sid <= 0) {
      return { status: 400, result: { msg: "Malformed data" } };
    }

    try {
      const sql = `UPDATE user_circuits SET uci_date = timestamp '${dtformat}' where uci_id = $1 AND uci_usr_id = $2;`;
      let res = await pool.query(sql, [sid, uid]);
      result = res.rows[0];

      return { status: 200, result: result };
    } catch (error) {
      console.log(error);
      return { status: 500, result: error };
    }
  } else {
    return { status: 400, result: { msg: `cannot schedule circuit for a past date (${dt})`} };
  }
};

module.exports.unscheduleUserCircuit = async function (userId, scheduleId) {
  const uid = parseInt(userId);
  const sid = parseInt(scheduleId);

  try {
    const sql = `UPDATE user_circuits SET uci_active = false WHERE uci_id = $1 AND uci_usr_id = $2;`;

    let result = await pool.query(sql, [sid, uid]);

    if (result.rowCount > 0) {
      return { status: 200, result };
    } else {
      return {
        status: 404,
        result: `User with id ${uid} and user_schedule id ${sid} not found`,
      };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.leaveTeam = async function (id, teamId) {
  try {
    const sql =
      "update team_members set tme_active = false where tme_usr_id = $1 and tme_tea_id = $2";

    let result = await pool.query(sql, [id, teamId]);

    if (result.rowCount > 0) {
      return { status: 200, result };
    } else {
      return {
        status: 404,
        result: `Member with ${id} and team id ${teamId} not found`,
      };
    }
  } catch (error) {
    return { status: 500, result: error };
  }
};
