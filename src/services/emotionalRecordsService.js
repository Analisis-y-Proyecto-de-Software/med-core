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

const monthNameToNumber = (month) => {
  const normalized = String(month || "").trim().toLowerCase();
  if (/^\d{1,2}$/.test(normalized)) {
    const numericMonth = Number(normalized);
    if (numericMonth >= 1 && numericMonth <= 12) {
      return numericMonth;
    }
  }
  const map = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };

  return map[normalized] || null;
};

const getMonthlySummaryByUser = async ({ userId, month, year }) => {
  const monthNumber = monthNameToNumber(month);
  const yearNumber = Number(year);

  if (!monthNumber || !Number.isInteger(yearNumber)) {
    throw new Error("Mes o anio invalido");
  }

  const query = `
    WITH days AS (
      SELECT generate_series(
        make_date($2, $3, 1),
        (make_date($2, $3, 1) + INTERVAL '1 month - 1 day')::date,
        INTERVAL '1 day'
      )::date AS day
    ),
    latest_emotional AS (
      SELECT
        DATE(er.created_at) AS day,
        ARRAY_AGG(es.name ORDER BY er.created_at DESC) AS emotional_states
      FROM emotional_records er
      JOIN emotional_states es
        ON er.emotional_state_id = es.id
      WHERE er.user_id = $1
        AND er.created_at >= make_date($2, $3, 1)
        AND er.created_at < (make_date($2, $3, 1) + INTERVAL '1 month')
      GROUP BY DATE(er.created_at)
    ),
    tasks_due AS (
      SELECT DATE(t.due_date) AS day, COUNT(*)::int AS tasks_due_count
      FROM tasks t
      WHERE t.user_id = $1
        AND t.due_date >= make_date($2, $3, 1)
        AND t.due_date < (make_date($2, $3, 1) + INTERVAL '1 month')
      GROUP BY DATE(t.due_date)
    )
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS date,
      COALESCE(le.emotional_states, ARRAY[]::text[]) AS emotional_states,
      COALESCE(td.tasks_due_count, 0) AS tasks_due_count
    FROM days d
    LEFT JOIN latest_emotional le ON le.day = d.day
    LEFT JOIN tasks_due td ON td.day = d.day
    ORDER BY d.day;
  `;

  const result = await pool.query(query, [userId, yearNumber, monthNumber]);
  return result.rows;
};

const getMonthlyCognitiveLoadByUser = async ({ userId, month, year }) => {
  const monthNumber = monthNameToNumber(month);
  const yearNumber = Number(year);

  if (!monthNumber || !Number.isInteger(yearNumber)) {
    throw new Error("Mes o anio invalido");
  }

  const query = `
    SELECT
      to_char(make_date($2, $3, 1), 'YYYY-MM') AS month,
      ROUND(AVG(100 - (er.emotional_state_id - 1) * (99.0 / 4)), 2) AS average_cognitive_load,
      COUNT(*)::int AS records_count
    FROM emotional_records er
    WHERE er.user_id = $1
      AND er.created_at >= make_date($2, $3, 1)
      AND er.created_at < (make_date($2, $3, 1) + INTERVAL '1 month');
  `;

  const result = await pool.query(query, [userId, yearNumber, monthNumber]);
  return result.rows[0];
};

module.exports = {
  listEmotionalRecordsByUser,
  getMonthlySummaryByUser,
  getMonthlyCognitiveLoadByUser,
};
