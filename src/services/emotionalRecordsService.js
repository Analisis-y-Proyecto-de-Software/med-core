const { pool } = require("./postgresClient");

const listEmotionalRecordsByUser = async (userId, date) => {
  let query = `
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
`;

  const params = [userId];

  if (date) {
    query += `      AND emotional_records.created_at::date = $2\n`;
    params.push(date);
  }

  query += `    ORDER BY emotional_records.created_at DESC;\n  `;

  const result = await pool.query(query, params);
  return result.rows;
};

const createEmotionalRecord = async (userId, emotionalStateId) => {
  const query = `
    WITH new_record AS (
      INSERT INTO emotional_records (user_id, emotional_state_id)
      VALUES ($1, $2)
      RETURNING id, user_id, emotional_state_id, created_at
    )
    SELECT
      new_record.id,
      new_record.user_id,
      new_record.emotional_state_id,
      emotional_states.name,
      new_record.created_at
    FROM new_record
    JOIN emotional_states
      ON new_record.emotional_state_id = emotional_states.id;
  `;

  const result = await pool.query(query, [userId, emotionalStateId]);
  return result.rows[0];
};

module.exports = {
  listEmotionalRecordsByUser,
  createEmotionalRecord,
};
