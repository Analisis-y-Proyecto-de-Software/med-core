const { listByUser, createForUser } = require("../controllers/emotionalRecordsController");
const emotionalRecordsService = require("../services/emotionalRecordsService");

jest.mock("../services/emotionalRecordsService");

describe("Pruebas Unitarias - emotionalRecordsController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: "user123" },
      query: {},
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
    test("Debe retornar 200 si la consulta es exitosa", async () => {
      const mockRecords = [{ id: 1, emotional_state_id: 2 }];
      req.query = { date: "2026-06-05", stateId: "2" };
      emotionalRecordsService.listEmotionalRecordsByUser.mockResolvedValue(mockRecords);

      await listByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    test("Debe retornar 400 si el stateId no es válido", async () => {
      req.query = { stateId: "not-a-number" };

      await listByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 500 si el servicio falla", async () => {
      emotionalRecordsService.listEmotionalRecordsByUser.mockRejectedValue(new Error("DB Error"));

      await listByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createForUser", () => {
    test("Debe retornar 201 si el registro es creado con éxito", async () => {
      req.body = { emotional_state_id: "2" };
      emotionalRecordsService.createEmotionalRecord.mockResolvedValue({ id: 99 });

      await createForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("Debe retornar 403 si el usuario no coincide", async () => {
      req.auth.sub = "wrongUser";

      await createForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("Debe retornar 400 si falta el emotional_state_id", async () => {
      req.body = {};

      await createForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 500 si ocurre una excepcion al guardar", async () => {
      req.body = { emotional_state_id: "3" };
      emotionalRecordsService.createEmotionalRecord.mockRejectedValue(new Error("Fatal"));

      await createForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});