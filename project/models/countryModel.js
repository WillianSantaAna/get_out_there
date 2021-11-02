const pool = require("./connection");

module.exports.getAllCountries = async () => {
  try {
    const sql = "SELECT * FROM countries ORDER BY cou_name ASC";
    let result = await pool.query(sql);

    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.getCountry = async (id) => {
  try {
    const sql = "SELECT * FROM countries WHERE cou_id = $1";
    let result = await pool.query(sql, [id]);

    if (result.rowCount > 0) {
      result = result.rows[0];
      return { status: 200, result };
    }

    return {
      status: 404,
      result: { msg: `Country with id ${id} not found` },
    };
  } catch (error) {
    return { status: 500, result: error };
  }
};
