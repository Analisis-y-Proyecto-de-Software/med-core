const { testConnection, pool } = require("../services/postgresClient");

describe("Pruebas Unitarias - postgresClient", () => {
  test("testConnection exitoso", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({ rows: ["2026-06-07"] });

    const result = await testConnection();

    expect(result.success).toBe(true);
  });

  test("testConnection fallido", async () => {
    jest.spyOn(pool, "query").mockRejectedValue(new Error("Timeout"));

    const result = await testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Timeout");
  });
});