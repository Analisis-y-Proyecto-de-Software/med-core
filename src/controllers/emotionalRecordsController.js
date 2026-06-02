const emotionalRecordsService = require("../services/emotionalRecordsService");

const listByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await emotionalRecordsService.listEmotionalRecordsByUser(userId);

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      message: "Error al listar registros emocionales",
      error: error.message,
    });
  }
};

const getMonthlySummaryByUser = async (req, res) => {
  try {
    const { userId, month } = req.params;
    const query = req.query || {};

    const year = query.year || query.anio || query.ano || null;

    if (!userId || !month || !year) {
      return res.status(400).json({
        message: "Faltan datos requeridos: userId, month y year",
      });
    }

    const result = await emotionalRecordsService.getMonthlySummaryByUser({
      userId,
      month,
      year,
    });

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    if (error.message === "Mes o anio invalido") {
      return res.status(400).json({
        message: "Mes o anio invalido",
      });
    }

    return res.status(500).json({
      message: "Error al obtener resumen mensual",
      error: error.message,
    });
  }
};

const getMonthlyCognitiveLoadByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = req.query || {};

    const month = query.month || query.mes || null;
    const year = query.year || query.anio || query.ano || null;

    if (!userId || !month || !year) {
      return res.status(400).json({
        message: "Faltan datos requeridos: userId, month y year",
      });
    }

    const result = await emotionalRecordsService.getMonthlyCognitiveLoadByUser({
      userId,
      month,
      year,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Mes o anio invalido") {
      return res.status(400).json({
        message: "Mes o anio invalido",
      });
    }

    return res.status(500).json({
      message: "Error al obtener carga cognitiva mensual",
      error: error.message,
    });
  }
};

module.exports = {
  listByUser,
  getMonthlySummaryByUser,
  getMonthlyCognitiveLoadByUser,
};
