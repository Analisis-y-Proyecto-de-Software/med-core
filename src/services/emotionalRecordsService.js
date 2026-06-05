const { pool } = require("./postgresClient");

const listEmotionalRecordsByUser = async (userId, date, stateId) => {
  const query = `
    SELECT
      er.id,
      er.user_id,
      er.emotional_state_id,
      es.name,
      er.created_at
    FROM emotional_records er
    JOIN emotional_states es
      ON er.emotional_state_id = es.id
    WHERE er.user_id = $1
      AND ($2::date IS NULL OR er.created_at::date = $2)
      AND ($3::integer IS NULL OR er.emotional_state_id = $3)
    ORDER BY er.created_at DESC;
  `;

  const result = await pool.query(query, [userId, date, stateId]);
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
