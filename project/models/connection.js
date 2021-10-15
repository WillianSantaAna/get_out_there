let pg = require("pg");

const connectionString = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/school2021_2`;

const Pool = pg.Pool;
const pool = new Pool({
  connectionString,
  max: 10,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

module.exports = pool;
