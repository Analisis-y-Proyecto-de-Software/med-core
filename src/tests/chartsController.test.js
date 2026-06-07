const { getEmotionalDistribution, getWeeklyTaskProgress, getCognitiveTrend } = require("../controllers/chartsController");
const chartsService = require("../services/chartsService");

jest.mock("../services/chartsService");

describe("Pruebas Unitarias - chartsController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { userId: "user123" }, query: { month: "5", year: "2026" } };
    res = { json: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  describe("getEmotionalDistribution & getWeeklyTaskProgress", () => {
    test("Debe retornar 400 si falta month o year", async () => {
      req.query.month = "";
      await getEmotionalDistribution(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 400 si los parametros numericos son invalidos", async () => {
      req.query.month = "13"; // Mes inexistente
      await getWeeklyTaskProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 200 si la respuesta del servicio es exitosa", async () => {
      chartsService.getEmotionalDistribution.mockResolvedValue({ data: [] });
      await getEmotionalDistribution(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si falla el servicio", async () => {
      chartsService.getWeeklyTaskProgress.mockRejectedValue(new Error("Fatal"));
      await getWeeklyTaskProgress(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getCognitiveTrend", () => {
    test("Debe usar el anio actual si no se provee query.year y responder 200", async () => {
      delete req.query.year;
      chartsService.getCognitiveTrend.mockResolvedValue({});
      await getCognitiveTrend(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 400 si el anio es menor a 2000 o invalido", async () => {
      req.query.year = "1999";
      await getCognitiveTrend(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 500 si falla el servicio de tendencia", async () => {
      req.query.year = "2026";
      chartsService.getCognitiveTrend.mockRejectedValue(new Error("Fail"));
      await getCognitiveTrend(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});