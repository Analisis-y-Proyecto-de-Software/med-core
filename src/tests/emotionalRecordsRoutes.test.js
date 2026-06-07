const request = require("supertest");
const express = require("express");
const router = require("../routes/emotionalRecordsRoutes");
const emotionalRecordsController = require("../controllers/emotionalRecordsController");

// Mock de Auth Middleware
jest.mock("../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    req.auth = { sub: "user123" };
    next();
  }
}));

jest.mock("../controllers/emotionalRecordsController");

const app = express();
app.use(express.json());
app.use("/api", router);

describe("Pruebas de Rutas e Integración - Middleware ensureValidMonth", () => {
  test("Debe pasar el control al controlador si el mes es valido", async () => {
    emotionalRecordsController.getMonthlySummaryByUser.mockImplementation((req, res) => res.sendStatus(200));
    
    const response = await request(app).get("/api/enero/user123?year=2026");
    expect(response.statusCode).toBe(200);
  });

  test("Debe saltarse la ruta (retornar 404) si el mes en la URL no es valido", async () => {
    const response = await request(app).get("/api/mesInvaladoFalso/user123?year=2026");
    expect(response.statusCode).toBe(404); // Salta la ruta por el next('route')
  });
});