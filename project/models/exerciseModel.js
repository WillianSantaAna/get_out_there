const pool = require("./connection");

module.exports.getAllExercises = async () => {
  try {
    const sql1 = "SELECT * FROM user_exercises";
    let result1 = await pool.query(sql1);
    const sql2 = "SELECT * FROM team_exercises";
    let result2 = await pool.query(sql2);

    result = [].concat(result1.rows, result2.rows);
    console.log(result)

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.getExerciseTypes = async () => {
  try {
    const sql = "SELECT * FROM exercise_types";
    let result = await pool.query(sql);

    result = result.rows;

    return { status: 200, result: result };
  } catch (error) {
    return { status: 500, result: error };
  }
};
