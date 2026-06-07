const request = require("supertest");
const express = require("express");
const tasksRoutes = require("../../routes/tasksRoutes");
const { pool } = require("../../services/postgresClient");

jest.mock("../../services/postgresClient", () => ({
  pool: { query: jest.fn() },
}));

jest.mock("../../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    req.auth = { sub: "user_integracion_123" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api", tasksRoutes);

describe("Pruebas de Integración - Operaciones Restantes de Tareas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/tasks/:userId/list -> Debe integrar la consulta y retornar el listado completo de la DB", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { id: 1, name: "Primera tarea", status: "pending" },
        { id: 2, name: "Segunda tarea", status: "done" }
      ]
    });

    const response = await request(app).get("/api/tasks/user_integracion_123/list");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].name).toBe("Primera tarea");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      expect.arrayContaining(["user_integracion_123"])
    );
  });

  test("PATCH /api/tasks/:taskId/status -> Debe impactar el nuevo estado en la DB de extremo a extremo", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 99, status: "in_progress" }]
    });

    const response = await request(app)
      .patch("/api/tasks/99/status")
      .send({ status: "in_progress" });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("in_progress");
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE tasks"),
      expect.arrayContaining(["in_progress", "99"])
    );
  });

  test("DELETE /api/tasks/:taskId -> Debe procesar la baja de la tarea correctamente", async () => {
    // CORRECCIÓN: Simulamos que la DB devuelve la fila eliminada (RETURNING *) para que el controlador responda 200
    pool.query.mockResolvedValue({ 
      rowCount: 1, 
      rows: [{ id: 99, name: "Tarea Eliminada" }] 
    });

    const response = await request(app).delete("/api/tasks/99");

    expect(response.statusCode).toBe(200);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM tasks"),
      expect.arrayContaining(["99"])
    );
  });
});