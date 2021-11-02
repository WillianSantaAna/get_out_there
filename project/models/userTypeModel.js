const pool = require("./connection");

module.exports.getAllUserTypes = async () => {
  try {
    const sql = "SELECT * FROM user_types";
    let result = await pool.query(sql);
    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};
