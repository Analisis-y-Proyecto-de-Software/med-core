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

module.exports = {
  listByUser,
};
