const tasksService = require("../services/tasksService");

const listByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await tasksService.listTasksByUser(userId);
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Error al listar tareas",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const { userId } = req.params;
    const body = req.body || {};

    const name =
      body.name ||
      body.title ||
      body.titulo ||
      body.nombre ||
      null;
    const description = body.description || body.descripcion || null;
    const dueDate = body.due_date || body.dueDate || body.fechaFin || body.fecha_fin || null;
    const estimatedTimeHours =
      body.estimated_time_hours ||
      body.estimatedTime ||
      body.tiempoEstimado ||
      body.tiempo_estimado ||
      null;
    const attachmentLink =
      body.attachment_link ||
      body.attachmentLink ||
      body.linkAdjunto ||
      body.link_adjunto ||
      null;

    if (!userId || !name) {
      return res.status(400).json({
        message: "Faltan datos requeridos: userId y titulo",
      });
    }

    const task = await tasksService.createTask({
      userId,
      name,
      description,
      dueDate,
      estimatedTimeHours,
      attachmentLink,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear tarea",
      error: error.message,
    });
  }
};

module.exports = {
  listByUser,
  create,
};
