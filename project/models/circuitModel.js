const pool = require("./connection");

module.exports.getAllCircuits = async () => {
  try {
    const sql = "SELECT * FROM circuits";
    let result = await pool.query(sql);

    result = result.rows;

    return { status: 200, result };
  } catch (error) {
    return { status: 500, result: error };
  }
};

module.exports.getCircuit = async (id) => {
  try {
    const sql = "SELECT * FROM circuits WHERE cir_id = $1";
    let result = await pool.query(sql, [id]);

    if (result.rowCount > 0) {
      result = result.rows[0];

      return { status: 200, result };
    }

    return {
      status: 400,
      result: { msg: `Circuit with id ${id} not found` },
    };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

module.exports.addCircuit = async (circuit) => {
  try {
    const { name, coords } = circuit;
    let coordinates = `[`;

    coords.forEach(({ lng, lat }, index) => {
      coordinates += `(${lng}, ${lat})`;

      if (index !== coords.length - 1) {
        coordinates += `, `;
      } else {
        coordinates += `]`;
      }
    });

    let sql = `INSERT INTO circuits (cir_name, cir_coords)
      VALUES ($1, $2) RETURNING cir_id`;

    let result = await pool.query(sql, [name, coordinates]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};
