const router = require("../routes/chartsRoutes");

describe("Pruebas de Rutas - chartsRoutes", () => {
  test("Debe inicializar y exportar el router de gráficos correctamente", () => {
    expect(router).toBeDefined();
    expect(typeof router).toBe("function"); // Los routers de express se exportan como funciones middlewares
  });
});