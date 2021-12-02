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
    const sql = `SELECT usr.usr_id, usr.usr_name, usr.usr_password, tea_id
    FROM users AS usr
    LEFT JOIN team_members AS tme ON usr.usr_id = tme.tme_usr_id AND tme.tme_active = true
    LEFT JOIN teams AS tea ON usr.usr_id = tea.tea_admin_id OR tme.tme_tea_id = tea.tea_id
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


module.exports.getUserCircuits = async function (id) {
  try {
    const sql = "SELECT * FROM circuits WHERE cir_id in (SELECT DISTINCT uci_cir_id FROM user_circuits WHERE uci_usr_id = $1);";
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

    return { status: 200, result: { msg: "Circuit created" } };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.getScheduledCircuits = async function (id) {
  try {
    const sql = "SELECT * FROM user_circuits WHERE uci_usr_id = $1 AND uci_completed = false AND uci_active = true AND uci_date != '1970-01-01 00:00:00' ORDER BY uci_date ASC;";
    let result = await pool.query(sql, [id]);

    result = result.rows;

    return { status: 200, result: result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.addScheduledCircuit = async function (id, data) {
  let dt = new Date(data.datetime);
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
};

module.exports.leaveTeam = async function (id, teamId) {
  try {
    const sql = "update team_members set tme_active = false where tme_usr_id = $1 and tme_tea_id = $2";

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
