const { pool } = require("./postgresClient");

const listTasksByUser = async (userId) => {
  const query = `
    SELECT
      id,
      user_id,
      name,
      status,
      description,
      due_date,
      estimated_time_hours,
      priority,
      attachment_link,
      developed_time_hours,
      created_at,
      updated_at
    FROM tasks
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  listTasksByUser,
};
