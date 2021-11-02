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
    const sql =
      "SELECT usr_id, usr_name, usr_password FROM users WHERE usr_email = $1";

    let result = await pool.query(sql, [email]);

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
    return { status: 500, result: error };
  }
};
