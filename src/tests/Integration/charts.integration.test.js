const request = require("supertest");
const express = require("express");
const chartsRoutes = require("../../routes/chartsRoutes");
const { pool } = require("../../services/postgresClient");

jest.mock("../../services/postgresClient", () => ({
  pool: { query: jest.fn() },
}));

// Mock de autenticación por si tus endpoints de gráficos validan el token
jest.mock("../../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    req.auth = { sub: "user123" };
    next();
  },
}));

const app = express();
app.use(express.json());

// COMBINACIÓN CORRECTA: Montamos en '/api' porque tu router interno ya maneja el prefijo '/charts'
app.use("/api", chartsRoutes);

describe("Pruebas de Integración - Módulos de Analítica y Gráficos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/charts/emotional-distribution -> Debe integrar la query y estructurar el formato Pie Chart", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { id: 1, name: "Feliz", count: 5 },
        { id: 2, name: "Estresado", count: 3 }
      ]
    });

    // Enviamos el userId en el .query() alineado con tu lógica de negocio
    const response = await request(app)
      .get("/api/charts/emotional-distribution")
      .query({ userId: "user123", month: "6", year: "2026" });

    expect(response.statusCode).toBe(200);
    expect(response.body.chart_type).toBe("pie");
    expect(response.body.total).toBe(8);
    expect(response.body.labels).toEqual(["Feliz", "Estresado"]);
    expect(response.body.data).toEqual([5, 3]);
  });

  test("GET /api/charts/weekly-progress -> Debe estructurar las 4 semanas fijas en formato Bar Chart", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { week_number: 1, total: 5, done: 3, pending: 2 },
        { week_number: 2, total: 4, done: 4, pending: 0 }
      ]
    });

    const response = await request(app)
      .get("/api/charts/weekly-progress")
      .query({ userId: "user123", month: "6", year: "2026" });

    expect(response.statusCode).toBe(200);
    expect(response.body.chart_type).toBe("bar");
    expect(response.body.labels).toEqual(["Semana 1", "Semana 2", "Semana 3", "Semana 4"]);
    expect(response.body.done).toEqual([3, 4, 0, 0]);
    expect(response.body.pending).toEqual([2, 0, 0, 0]);
  });

  test("GET /api/charts/cognitive-trend -> Debe mapear los 12 meses del año en formato Line Chart", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { month_number: 1, average_cognitive_load: "75.50", records_count: 4 },
        { month_number: 6, average_cognitive_load: "42.10", records_count: 2 }
      ]
    });

    const response = await request(app)
      .get("/api/charts/cognitive-trend")
      .query({ userId: "user123", year: "2026" });

    expect(response.statusCode).toBe(200);
    expect(response.body.chart_type).toBe("line");
    expect(response.body.labels).toContain("Enero");
    expect(response.body.labels).toContain("Junio");
    expect(response.body.values[0]).toBe(75.5);
    expect(response.body.values[5]).toBe(42.1);
    expect(response.body.values[11]).toBeNull();
  });
});