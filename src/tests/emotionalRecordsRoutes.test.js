const request = require("supertest");
const app = require("../../app");
const emotionalRecordsService = require("../services/emotionalRecordsService");

jest.mock("../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    req.auth = { sub: "user123" };
    next();
  }
}));

jest.mock("../services/emotionalRecordsService");

describe("Pruebas de Integración - Rutas de Registros Emocionales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/emotionalrecords/:userId/list -> Debe responder 200", async () => {
    emotionalRecordsService.listEmotionalRecordsByUser.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/emotionalrecords/user123/list");

    expect(response.statusCode).toBe(200);
  });

  test("POST /api/emotionalrecords/:userId/create -> Debe responder 201", async () => {
    emotionalRecordsService.createEmotionalRecord.mockResolvedValue({});

    const response = await request(app)
      .post("/api/emotionalrecords/user123/create")
      .send({ emotional_state_id: 3 });

    expect(response.statusCode).toBe(201);
  });
});