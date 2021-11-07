const pool = require("./connection");
const bcrypt = require("bcrypt");

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
  const type = parseInt(user.type);
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

  if (typeof type !== "number" || type <= 0) {
    return { status: 400, result: { msg: "Invalid user type" } };
  }

  if (typeof country !== "number" || country <= 0) {
    return { status: 400, result: { msg: "Invalid country id" } };
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    const sql = `INSERT INTO users 
      (usr_name, usr_email, usr_password, usr_type_id, usr_country_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING usr_id, usr_name`;
    let result = await pool.query(sql, [name, email, hash, type, country]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.login = async (user) => {
  try {
    const { email, password } = user;
    const sql = `SELECT usr.usr_id, usr.usr_name,usr.usr_password, tsr.tsr_tea_id 
      FROM users AS usr
      LEFT JOIN teams_users AS tsr ON usr.usr_id = tsr.tsr_usr_id
      WHERE usr.usr_email = $1`;

    let result = await pool.query(sql, [email]);
    console.log(result);

    if (result.rowCount <= 0) {
      return { status: 400, result: { msg: "Wrong email" } };
    }

    result = result.rows[0];

    const match = await bcrypt.compare(password, result.usr_password);

    if (match) {
      delete result.usr_password;

      return { status: 200, result };
    } else {
      return { status: 400, result: { msg: "Wrong password" } };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};
