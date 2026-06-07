const { getHealthStatus } = require("../services/healthService");
const { testConnection } = require("../services/postgresClient");

jest.mock("../services/postgresClient");

describe("Pruebas Unitarias - healthService", () => {
  test("getHealthStatus retorna estado 'connected' exitoso", async () => {
    testConnection.mockResolvedValue({ success: true });

    const response = await getHealthStatus();

    expect(response.status).toBe("ok");
    expect(response.database).toBe("connected");
  });

  test("getHealthStatus retorna estado 'error' si falla", async () => {
    testConnection.mockResolvedValue({ success: false, error: "Bad Connection" });

    const response = await getHealthStatus();

    expect(response.database).toBe("error");
    expect(response.databaseError).toBe("Bad Connection");
  });
});