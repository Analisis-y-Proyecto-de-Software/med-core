const request = require("supertest");
const express = require("express");
const router = require("../routes/healthRoutes");
const healthController = require("../controllers/healthController");

// Mockear el controlador para aislar la prueba de la ruta
jest.mock("../controllers/healthController", () => ({
  getHelloWorld: jest.fn((req, res) => res.sendStatus(200)),
  getHealth: jest.fn((req, res) => res.sendStatus(200)),
}));

const app = express();
app.use("/", router);

describe("Pruebas de Rutas - healthRoutes", () => {
  test("GET /hola-mundo debe llamar al controlador correspondiente", async () => {
    const res = await request(app).get("/hola-mundo");
    expect(res.statusCode).toBe(200);
    expect(healthController.getHelloWorld).toHaveBeenCalled();
  });

  test("GET /health debe llamar al controlador correspondiente", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(healthController.getHealth).toHaveBeenCalled();
  });
});