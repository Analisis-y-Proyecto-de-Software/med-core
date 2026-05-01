const { pool } = require("./postgresClient");

const listEmotionalRecordsByUser = async (userId) => {
  const query = `
    SELECT
      emotional_records.id,
      emotional_records.user_id,
      emotional_records.emotional_state_id,
      emotional_states.name,
      emotional_records.created_at
    FROM emotional_records
    JOIN emotional_states
      ON emotional_records.emotional_state_id = emotional_states.id
    WHERE emotional_records.user_id = $1
    ORDER BY emotional_records.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  listEmotionalRecordsByUser,
};
