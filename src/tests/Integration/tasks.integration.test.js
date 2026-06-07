const request = require("supertest");
const express = require("express");
const tasksRoutes = require("../../routes/tasksRoutes");
const { pool } = require("../../services/postgresClient");

// 1. Mockeamos ÚNICAMENTE la base de datos para controlar sus respuestas sin tocarla realmente, pero dejamos que el resto del flujo (rutas, controladores, servicios) funcione con su lógica real para probar la integración completa
jest.mock("../../services/postgresClient", () => ({
  pool: {
    query: jest.fn(),
  },
}));

// 2. Mockeamos el Middleware de autenticación para inyectar un usuario simulado en el flujo real
jest.mock("../../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    req.auth = { sub: "user_integracion_123" };
    next();
  },
}));

// 3. Montamos una mini-app de Express express para simular el servidor real corriendo
const app = express();
app.use(express.json());
app.use("/api", tasksRoutes);

describe("Pruebas de Integración - Flujo de Tareas (End-to-End Local)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/tasks/:userId/create -> Debe integrar Ruta, Controller, Service y DB con éxito", async () => {
    const payload = {
      title: "Mi Tarea de Integración", // Enviamos el texto limpio sin espacios
      description: "Probando el flujo completo sin romper nada",
      priority: "high"
    };

    // Simulamos la respuesta de la base de datos exactamente como la espera tu app
    pool.query.mockResolvedValue({
      rows: [
        {
          id: 42,
          user_id: "user_integracion_123",
          name: "Mi Tarea de Integración",
          status: "pending",
          description: "Probando el flujo completo sin romper nada",
          priority: "high"
        }
      ]
    });

    // Lanzamos el disparo HTTP real al endpoint
    const response = await request(app)
      .post("/api/tasks/user_integracion_123/create")
      .send(payload);

    // --- ASERSIONES DE INTEGRACIÓN ---
    
    // A. Verificamos la respuesta final del servidor
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id", 42);
    expect(response.body.name).toBe("Mi Tarea de Integración");

    // B. Verificamos que los parámetros enviados a la Query coincidan con tu lógica real
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO tasks"),
      expect.arrayContaining([
        "user_integracion_123",
        "Mi Tarea de Integración",
        "Probando el flujo completo sin romper nada",
        "high"
      ])
    );
  });

  test("GET /api/summary/:userId -> Debe calcular recomendaciones reales integrando la lógica del Controller con datos del Service", async () => {
    // Simulamos que el servicio fue a la DB y trajo que el usuario tiene 6 tareas pendientes de 10 agendadas
    pool.query.mockResolvedValue({
      rows: [
        {
          date: "2026-06-07",
          tasks_scheduled: 10,
          tasks_done: 4,
          tasks_pending: 6
        }
      ]
    });

    const response = await request(app).get("/api/summary/user_integracion_123");

    expect(response.statusCode).toBe(200);
    expect(response.body.tasksPending).toBe(6);
    
    // Aquí validamos la integración con la función interna buildRecommendation: 
    // Como 6/10 >= 0.7 o pendientes >= 5, el controlador debió añadir la recomendación de carga alta automáticamente
    expect(response.body.recommendation).toBe(
      "Tienes una carga alta hoy. Toma pausas activas y prioriza tus tareas."
    );
  });
});