const chartsService = require("../services/chartsService");

const getEmotionalDistribution = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Se requieren los parametros month y year",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12 ||
      !Number.isInteger(yearNum) || yearNum < 2000
    ) {
      return res.status(400).json({
        message: "Parametros invalidos. month debe ser 1-12 y year un año valido",
      });
    }

    const data = await chartsService.getEmotionalDistribution({
      userId,
      month: monthNum,
      year: yearNum,
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener distribucion emocional",
      error: error.message,
    });
  }
};

const getWeeklyTaskProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Se requieren los parametros month y year",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (
      !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12 ||
      !Number.isInteger(yearNum) || yearNum < 2000
    ) {
      return res.status(400).json({
        message: "Parametros invalidos. month debe ser 1-12 y year un año valido",
      });
    }

    const data = await chartsService.getWeeklyTaskProgress({
      userId,
      month: monthNum,
      year: yearNum,
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener progreso semanal de tareas",
      error: error.message,
    });
  }
};

const getCognitiveTrend = async (req, res) => {
  try {
    const { userId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const yearNum = Number(year);

    if (!Number.isInteger(yearNum) || yearNum < 2000) {
      return res.status(400).json({
        message: "Parametro year invalido",
      });
    }

    const data = await chartsService.getCognitiveTrend({
      userId,
      year: yearNum,
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener tendencia de carga cognitiva",
      error: error.message,
    });
  }
};

module.exports = {
  getEmotionalDistribution,
  getWeeklyTaskProgress,
  getCognitiveTrend,
};
