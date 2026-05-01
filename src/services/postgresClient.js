const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
});

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    return {
      success: true,
      message: "conexion correcta",
      timestamp: result.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      message: "Error en la conexion",
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  testConnection,
};
