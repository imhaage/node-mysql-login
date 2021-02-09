require("dotenv").config();
const promisify = require("util").promisify;
const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DB
});

pool.getConnection((err, connection) => {
  console.error(err || "MySQL connection : OK");
  if (connection) connection.release();
});

pool.query = promisify(pool.query);

module.exports = pool;
