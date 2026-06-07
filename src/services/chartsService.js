const { pool } = require("./postgresClient");

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const getEmotionalDistribution = async ({ userId, month, year }) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  const query = `
    SELECT
      es.id,
      es.name,
      COUNT(*)::int AS count
    FROM emotional_records er
    JOIN emotional_states es ON er.emotional_state_id = es.id
    WHERE er.user_id = $1
      AND EXTRACT(MONTH FROM er.created_at) = $2
      AND EXTRACT(YEAR FROM er.created_at) = $3
    GROUP BY es.id, es.name
    ORDER BY es.id;
  `;

  const result = await pool.query(query, [userId, monthNumber, yearNumber]);
  const rows = result.rows;

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return {
    period: `${yearNumber}-${String(monthNumber).padStart(2, "0")}`,
    labels: rows.map((r) => r.name),
    data: rows.map((r) => r.count),
    total,
    chart_type: "pie",
  };
};

const getWeeklyTaskProgress = async ({ userId, month, year }) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  const query = `
    SELECT
      LEAST(CEIL(EXTRACT(DAY FROM due_date) / 7.0)::int, 4) AS week_number,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'done')::int AS done,
      COUNT(*) FILTER (WHERE status IN ('pending', 'in_progress'))::int AS pending
    FROM tasks
    WHERE user_id = $1
      AND EXTRACT(MONTH FROM due_date) = $2
      AND EXTRACT(YEAR FROM due_date) = $3
    GROUP BY week_number
    ORDER BY week_number;
  `;

  const result = await pool.query(query, [userId, monthNumber, yearNumber]);
  const rows = result.rows;

  const allWeeks = [1, 2, 3, 4];
  const weekMap = {};
  rows.forEach((r) => {
    weekMap[r.week_number] = r;
  });

  const labels = allWeeks.map((w) => `Semana ${w}`);
  const done = allWeeks.map((w) => (weekMap[w] ? weekMap[w].done : 0));
  const pending = allWeeks.map((w) => (weekMap[w] ? weekMap[w].pending : 0));

  return {
    period: `${yearNumber}-${String(monthNumber).padStart(2, "0")}`,
    labels,
    done,
    pending,
    chart_type: "bar",
  };
};

const getCognitiveTrend = async ({ userId, year }) => {
  const yearNumber = Number(year);

  const query = `
    SELECT
      EXTRACT(MONTH FROM er.created_at)::int AS month_number,
      ROUND(AVG(100 - (er.emotional_state_id - 1) * (99.0 / 4)), 2) AS average_cognitive_load,
      COUNT(*)::int AS records_count
    FROM emotional_records er
    WHERE er.user_id = $1
      AND EXTRACT(YEAR FROM er.created_at) = $2
    GROUP BY month_number
    ORDER BY month_number;
  `;

  const result = await pool.query(query, [userId, yearNumber]);
  const rows = result.rows;

  const monthMap = {};
  rows.forEach((r) => {
    monthMap[r.month_number] = r;
  });

  const labels = MONTH_NAMES;
  const values = Array.from({ length: 12 }, (_, i) => {
    const m = monthMap[i + 1];
    return m ? parseFloat(m.average_cognitive_load) : null;
  });
  const records_counts = Array.from({ length: 12 }, (_, i) => {
    const m = monthMap[i + 1];
    return m ? m.records_count : 0;
  });

  return {
    year: yearNumber,
    labels,
    values,
    records_counts,
    chart_type: "line",
  };
};

module.exports = {
  getEmotionalDistribution,
  getWeeklyTaskProgress,
  getCognitiveTrend,
};
