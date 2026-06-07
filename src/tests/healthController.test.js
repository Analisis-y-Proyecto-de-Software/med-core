const { getHelloWorld, getHealth } = require("../controllers/healthController");
const healthService = require("../services/healthService");
const { testConnection } = require("../services/postgresClient");

jest.mock("../services/healthService");
jest.mock("../services/postgresClient");

describe("Pruebas Unitarias - healthController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("getHelloWorld responde 200 si la conexion es exitosa", async () => {
    testConnection.mockResolvedValue({ success: true });

    await getHelloWorld(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getHelloWorld responde 500 si la conexion falla", async () => {
    testConnection.mockResolvedValue({ success: false, error: "Fail" });

    await getHelloWorld(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getHealth responde 200 con el estado", async () => {
    healthService.getHealthStatus.mockResolvedValue({ status: "ok" });

    await getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getHealth responde 500 si falla el servicio", async () => {
    healthService.getHealthStatus.mockRejectedValue(new Error("Error"));

    await getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});