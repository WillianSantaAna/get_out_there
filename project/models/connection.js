const pg = require("pg");

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

const Pool = pg.Pool;
const types = pg.types;

const pool = new Pool({
  connectionString,
  max: 10,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

types.setTypeParser(20, (val) => parseInt(val));

types.setTypeParser(602, (val) => {
  let coords = val.slice(2, val.length - 2);
  coords = coords.split("),(");

  coords = coords.map((coord) => {
    let tmp = coord.split(",");

    return { lng: parseFloat(tmp[0]), lat: parseFloat(tmp[1]) };
  });

  return coords;
});

module.exports = pool;
