const { pool } = require("./postgresClient");

const normalizeValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return value;
};

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

const createTask = async ({
  userId,
  name,
  description,
  dueDate,
  estimatedTimeHours,
  attachmentLink,
  priority,
}) => {
  const query = `
    INSERT INTO tasks (
      user_id,
      name,
      description,
      due_date,
      estimated_time_hours,
      attachment_link,
      priority
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
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
      updated_at;
  `;

  const values = [
    userId,
    normalizeValue(name),
    normalizeValue(description),
    normalizeValue(dueDate),
    normalizeValue(estimatedTimeHours),
    normalizeValue(attachmentLink),
    normalizeValue(priority),
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateTaskStatus = async ({ taskId, status }) => {
  const query = `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING
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
      updated_at;
  `;

  const result = await pool.query(query, [status, taskId]);
  return result.rows[0];
};

const deleteTask = async (taskId) => {
  const query = `
    DELETE FROM tasks
    WHERE id = $1
    RETURNING
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
      updated_at;
  `;

  const result = await pool.query(query, [taskId]);
  return result.rows[0];
};

module.exports = {
  listTasksByUser,
  createTask,
  updateTaskStatus,
  deleteTask,
};
