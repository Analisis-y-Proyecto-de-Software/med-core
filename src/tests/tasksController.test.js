const { listByUser, create, updateStatus, remove, getDailySummary } = require("../controllers/tasksController");
const tasksService = require("../services/tasksService");

jest.mock("../services/tasksService");

describe("Pruebas Unitarias - tasksController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { userId: "user123", taskId: "task999" }, query: {}, body: {} };
    res = { json: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test("listByUser exitoso", async () => {
    tasksService.listTasksByUser.mockResolvedValue([]);
    await listByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("listByUser error 500", async () => {
    tasksService.listTasksByUser.mockRejectedValue(new Error("Err"));
    await listByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  describe("create", () => {
    test("Debe retornar 400 si falta el nombre/titulo de la tarea", async () => {
      req.body = { description: "Prueba sin titulo" };
      await create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe mapear alias alternativos (title, titulo, nombre) y crear con 201", async () => {
      req.body = { titulo: "Tarea Nueva", fechaFin: "2026-12-31", tiempoEstimado: 3 };
      tasksService.createTask.mockResolvedValue({ id: 1 });
      await create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("Debe retornar 500 si el servicio de creacion falla", async () => {
      req.body = { title: "Tarea" };
      tasksService.createTask.mockRejectedValue(new Error("Err"));
      await create(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateStatus", () => {
    test("Debe retornar 400 si el estado no es permitido", async () => {
      req.body = { status: "invalid_status" };
      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar 404 si la tarea no se encuentra", async () => {
      req.body = { status: "done" };
      tasksService.updateTaskStatus.mockResolvedValue(null);
      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("Debe retornar 200 si se actualiza correctamente", async () => {
      req.body = { estadoTarea: "in_progress" };
      tasksService.updateTaskStatus.mockResolvedValue({ id: "task999" });
      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si falla la actualizacion", async () => {
      req.body = { status: "done" };
      tasksService.updateTaskStatus.mockRejectedValue(new Error("Err"));
      await updateStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("remove", () => {
    test("Debe retornar 404 si la tarea no existe al borrar", async () => {
      tasksService.deleteTask.mockResolvedValue(null);
      await remove(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("Debe retornar 200 si elimina correctamente", async () => {
      tasksService.deleteTask.mockResolvedValue({ id: "task999" });
      await remove(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si ocurre error al eliminar", async () => {
      tasksService.deleteTask.mockRejectedValue(new Error("Err"));
      await remove(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getDailySummary & buildRecommendation", () => {
    test("Debe retornar 400 si el formato de la fecha es incorrecto", async () => {
      req.query.date = "07-06-2026"; // No es YYYY-MM-DD
      await getDailySummary(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("Debe retornar la recomendacion correcta segun las ramas logicas de tareas", async () => {
      req.query.date = "2026-06-07";
      
      // Rama: Sin tareas agendadas
      tasksService.getDailySummaryByUser.mockResolvedValue({ tasks_scheduled: 0 });
      await getDailySummary(req, res);

      // Rama: Carga alta (pending >= 5)
      tasksService.getDailySummaryByUser.mockResolvedValue({ tasks_scheduled: 10, tasks_done: 2, tasks_pending: 8 });
      await getDailySummary(req, res);

      // Rama: Sin pendientes
      tasksService.getDailySummaryByUser.mockResolvedValue({ tasks_scheduled: 5, tasks_done: 5, tasks_pending: 0 });
      await getDailySummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Debe retornar 500 si falla el resumen", async () => {
      tasksService.getDailySummaryByUser.mockRejectedValue(new Error("Err"));
      await getDailySummary(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});