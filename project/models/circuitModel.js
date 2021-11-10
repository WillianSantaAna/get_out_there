const pool = require("./connection");

module.exports.getAllCircuits = async () => {
  try {
    const sql = "SELECT * FROM circuits";
    let result = await pool.query(sql);

    result = result.rows;

    result = result.map((row) => {
      let temp = row;
      temp.cir_coords = parseCoords(temp.cir_coords);

      return temp;
    });

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

      result.cir_coords = parseCoords(result.cir_coords);

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
    const { name, userId, coords } = circuit;
    let coordinates = `[`;

    coords.forEach(({ lng, lat }, index) => {
      coordinates += `(${lng}, ${lat})`;

      if (index !== coords.length - 1) {
        coordinates += `, `;
      } else {
        coordinates += `]`;
      }
    });

    let sql = `INSERT INTO circuits (cir_name, cir_coords, cir_usr_id)
      VALUES ($1, $2, $3) RETURNING cir_id`;

    let result = await pool.query(sql, [name, coordinates, userId]);

    result = result.rows[0];

    return { status: 200, result };
  } catch (error) {
    console.log(error);
    return { status: 500, result: error };
  }
};

function parseCoords(coords) {
  let newCoords = coords.slice(2, coords.length - 2);
  newCoords = newCoords.split("),(");

  newCoords = newCoords.map((coord) => {
    let tempCoords = coord.split(",");

    return { lng: parseFloat(tempCoords[0]), lat: parseFloat(tempCoords[1]) };
  });

  return newCoords;
}
