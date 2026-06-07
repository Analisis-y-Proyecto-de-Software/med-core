const request = require("supertest");
const express = require("express");
const router = require("../routes/tasksRoutes");
const tasksController = require("../controllers/tasksController");

// Mockear el middleware de autenticación para que deje pasar las peticiones
jest.mock("../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => next(),
}));

// Mockear todos los métodos del controlador de tareas
jest.mock("../controllers/tasksController", () => ({
  getDailySummary: jest.fn((req, res) => res.sendStatus(200)),
  listByUser: jest.fn((req, res) => res.sendStatus(200)),
  create: jest.fn((req, res) => res.sendStatus(201)),
  updateStatus: jest.fn((req, res) => res.sendStatus(200)),
  remove: jest.fn((req, res) => res.sendStatus(200)),
}));

const app = express();
app.use("/", router);

describe("Pruebas de Rutas - tasksRoutes", () => {
  test("GET /summary/:userId", async () => {
    const res = await request(app).get("/summary/user123");
    expect(res.statusCode).toBe(200);
    expect(tasksController.getDailySummary).toHaveBeenCalled();
  });

  test("GET /tasks/:userId/list", async () => {
    const res = await request(app).get("/tasks/user123/list");
    expect(res.statusCode).toBe(200);
    expect(tasksController.listByUser).toHaveBeenCalled();
  });

  test("POST /tasks/:userId/create", async () => {
    const res = await request(app).post("/tasks/user123/create");
    expect(res.statusCode).toBe(201);
    expect(tasksController.create).toHaveBeenCalled();
  });

  test("PATCH /tasks/:taskId/status", async () => {
    const res = await request(app).patch("/tasks/task123/status");
    expect(res.statusCode).toBe(200);
    expect(tasksController.updateStatus).toHaveBeenCalled();
  });

  test("DELETE /tasks/:taskId", async () => {
    const res = await request(app).delete("/tasks/task123");
    expect(res.statusCode).toBe(200);
    expect(tasksController.remove).toHaveBeenCalled();
  });
});