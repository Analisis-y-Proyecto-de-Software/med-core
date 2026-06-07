const request = require("supertest");
const app = require("../../../app"); 
const { pool } = require("../../services/postgresClient");

// 1. CAMBIA ESTO: Pon aquí un ID de usuario que de verdad exista en tu base de datos local
const VALID_USER_ID = "84e894a8-e001-7033-d7f1-d871dcc6d608"; 

jest.mock("../../middlewares/cognitoAuth", () => ({
  cognitoAuth: (req, res, next) => {
    // Sincronizamos el middleware con el mismo ID real
    req.user = { sub: VALID_USER_ID }; 
    next();
  },
}));

describe("Pruebas End-to-End (E2E) - Flujo de Tareas", () => {
  
  beforeAll(async () => {
    // Limpiamos las tareas viejas de ese usuario de prueba para no duplicar
    await pool.query("DELETE FROM tasks WHERE user_id = $1", [VALID_USER_ID]);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM tasks WHERE user_id = $1", [VALID_USER_ID]);
    await pool.end();
  });
    // ==========================================
    // PRUEBA 1: Crear, listar y eliminar una tarea (flujo completo)
    // ==========================================
  test("Flujo Completo: Crear, listar y eliminar una tarea en la DB real", async () => {
    
    // PASO 1: Crear la tarea (POST)
    const createResponse = await request(app)
      .post(`/tasks/${VALID_USER_ID}/create`) // URL dinámica con el usuario real
      .send({
        name: "Nueva tarea E2E",
        description: "Probando el circuito real"
      });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.body).toHaveProperty("id");
    const taskId = createResponse.body.id; 

    // PASO 2: Obtener la lista de tareas del usuario (GET)
    const getResponse = await request(app)
      .get(`/tasks/${VALID_USER_ID}/list`);

    expect(getResponse.statusCode).toBe(200);
    const tareaCreada = getResponse.body.find(task => task.id === taskId);
    expect(tareaCreada).toBeDefined();

    expect(tareaCreada.name).toBe("Nueva tarea E2E");

    // PASO 3: Eliminar la tarea (DELETE)
    const deleteResponse = await request(app)
      .delete(`/tasks/${taskId}`);

    expect(deleteResponse.statusCode).toBe(200);

    // PASO 4: Verificar que ya no aparezca en la lista
    const verifyResponse = await request(app)
      .get(`/tasks/${VALID_USER_ID}/list`);
    
    const tareaEliminada = verifyResponse.body.find(task => task.id === taskId);
    expect(tareaEliminada).toBeUndefined(); 
  });
  // ==========================================
  // PRUEBA 2: Actualizar el estado de una tarea
  // ==========================================
  test("Prueba 2: Crear una tarea y actualizar su estado a completada", async () => {
    // 1. Creamos la tarea base (nace como 'pending' según tu log)
    const createResponse = await request(app)
      .post(`/tasks/${VALID_USER_ID}/create`)
      .send({
        name: "Tarea para cambiar estado",
        description: "Debe pasar a completada"
      });

    const taskId = createResponse.body.id;

    // 2. Le pegamos a tu ruta PATCH real para actualizar el estado
    const updateResponse = await request(app)
      .patch(`/tasks/${taskId}/status`)
      .send({ status: "done" }); 

    expect(updateResponse.statusCode).toBe(200);

    // 3. Verificamos en la lista si de verdad cambió en la DB
    const getResponse = await request(app)
      .get(`/tasks/${VALID_USER_ID}/list`);

    const tareaActualizada = getResponse.body.find(task => task.id === taskId);
    expect(tareaActualizada.status).toBe("done");

    // 4. Limpieza: La borramos para dejar la DB limpia
    await request(app).delete(`/tasks/${taskId}`);
  });

  // ==========================================
  // PRUEBA 3: Obtener el resumen diario
  // ==========================================
  test("Prueba 3: Obtener el resumen diario de tareas del usuario", async () => {
    // 1. Le pegamos a tu ruta de summary real
    const summaryResponse = await request(app)
      .get(`/summary/${VALID_USER_ID}`);

    // 2. Verificamos que el endpoint responda con éxito
    expect(summaryResponse.statusCode).toBe(200);
    
    // 3. Aquí hacemos una aserción básica del diseño de tu respuesta.
    // Por lo general, un summary devuelve un objeto o un número. 
    // Evaluamos que al menos devuelva la respuesta esperada sin romperse.
    expect(summaryResponse.body).toBeDefined();
  });
});