const { listTasksByUser, createTask, updateTaskStatus, deleteTask, getDailySummaryByUser } = require("../services/tasksService");
const { pool } = require("../services/postgresClient");

describe("Pruebas Unitarias - tasksService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("normalizeValue handling interno", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [{ id: 1 }] });
    
    // Provocamos normalizaciones enviando strings vacios, nulls y valores reales
    await createTask({
      userId: "u1",
      name: "   ", // Se convertira en null
      description: null,
      dueDate: "2026-06-07",
    });

    expect(pool.query).toHaveBeenCalled();
  });

  test("listTasksByUser, updateTaskStatus, deleteTask, getDailySummaryByUser ejecutan consultas SQL", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [{ tasks_scheduled: 1 }] });

    await listTasksByUser("u1");
    await updateTaskStatus({ taskId: 1, status: "done" });
    await deleteTask(1);
    const summary = await getDailySummaryByUser({ userId: "u1", date: "2026-06-07" });

    expect(summary.tasks_scheduled).toBe(1);
  });
});