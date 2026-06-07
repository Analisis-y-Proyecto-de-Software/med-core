const { getEmotionalDistribution, getWeeklyTaskProgress, getCognitiveTrend } = require("../services/chartsService");
const { pool } = require("../services/postgresClient");

describe("Pruebas Unitarias - chartsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getEmotionalDistribution procesa las filas y calcula totales", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [
        { id: 1, name: "Feliz", count: 4 },
        { id: 2, name: "Estresado", count: 2 }
      ]
    });

    const result = await getEmotionalDistribution({ userId: "u1", month: 6, year: 2026 });
    expect(result.total).toBe(6);
    expect(result.chart_type).toBe("pie");
  });

  test("getWeeklyTaskProgress rellena las semanas vacias con ceros", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ week_number: 1, total: 3, done: 2, pending: 1 }]
    });

    const result = await getWeeklyTaskProgress({ userId: "u1", month: 6, year: 2026 });
    expect(result.done[0]).toBe(2);
    expect(result.done[1]).toBe(0); // Semana 2 sin datos mapea a 0
    expect(result.chart_type).toBe("bar");
  });

  test("getCognitiveTrend mapea los 12 meses", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({
      rows: [{ month_number: 1, average_cognitive_load: "75.50", records_count: 5 }]
    });

    const result = await getCognitiveTrend({ userId: "u1", year: 2026 });
    expect(result.values[0]).toBe(75.5);
    expect(result.values[1]).toBeNull(); // Mes sin datos es null
  });
});