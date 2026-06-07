const { 
  listByUser, 
  createForUser, 
  getMonthlySummaryByUser, 
  getMonthlyCognitiveLoadByUser 
} = require("../controllers/emotionalRecordsController");
const emotionalRecordsService = require("../services/emotionalRecordsService");

jest.mock("../services/emotionalRecordsService");

describe("Pruebas Unitarias - emotionalRecordsController (Actualizado)", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: "user123", month: "enero" },
      query: { year: "2026" },
      body: {},
      auth: { sub: "user123" }
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("listByUser", () => {
    test("Debe retornar 400 si stateId no es un numero valido", async () => {
      req.query.stateId = "not-a-number";
      await listByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 200 con los registros", async () => {
      req.query.stateId = "2";
      emotionalRecordsService.listEmotionalRecordsByUser.mockResolvedValue([]);
      await listByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si falla el servicio", async () => {
      emotionalRecordsService.listEmotionalRecordsByUser.mockRejectedValue(new Error("Error"));
      await listByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createForUser", () => {
    test("Debe retornar 403 si el usuario no coincide", async () => {
      req.auth.sub = "otroUsuario";
      await createForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("Debe retornar 400 si falta el emotional_state_id o es invalido", async () => {
      req.body.emotional_state_id = "invalido";
      await createForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 201 si se crea con exito", async () => {
      req.body.emotional_state_id = "3";
      emotionalRecordsService.createEmotionalRecord.mockResolvedValue({ id: 1 });
      await createForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("Debe retornar 500 si el servicio falla al crear", async () => {
      req.body.emotional_state_id = "3";
      emotionalRecordsService.createEmotionalRecord.mockRejectedValue(new Error("Fail"));
      await createForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getMonthlySummaryByUser", () => {
    test("Debe retornar 400 si el anio no es valido", async () => {
      req.query.year = "26"; // No cumple con YYYY
      await getMonthlySummaryByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 200 con el resumen mensual", async () => {
      emotionalRecordsService.getMonthlySummaryByUser.mockResolvedValue({ data: "summary" });
      await getMonthlySummaryByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si el servicio arroja error", async () => {
      emotionalRecordsService.getMonthlySummaryByUser.mockRejectedValue(new Error("Error"));
      await getMonthlySummaryByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getMonthlyCognitiveLoadByUser", () => {
    test("Debe retornar 400 si falta el parametro month", async () => {
      req.query.month = "";
      await getMonthlyCognitiveLoadByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 400 si el anio es invalido", async () => {
      req.query.month = "enero";
      req.query.year = "abc";
      await getMonthlyCognitiveLoadByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 200 con la carga cognitiva", async () => {
      req.query.month = "enero";
      emotionalRecordsService.getMonthlyCognitiveLoadByUser.mockResolvedValue({});
      await getMonthlyCognitiveLoadByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 en caso de excepcion", async () => {
      req.query.month = "enero";
      emotionalRecordsService.getMonthlyCognitiveLoadByUser.mockRejectedValue(new Error("Err"));
      await getMonthlyCognitiveLoadByUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});