const emotionalRecordsService = require("../services/emotionalRecordsService");

const listByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, stateId } = req.query;
    const dateFilter = date || null;
    const stateIdFilter = stateId != null && stateId !== "" ? Number(stateId) : null;

    if (stateId != null && stateId !== "" && Number.isNaN(stateIdFilter)) {
      return res.status(400).json({
        message: "stateId debe ser un número válido cuando se provee",
      });
    }

    const records = await emotionalRecordsService.listEmotionalRecordsByUser(
      userId,
      dateFilter,
      stateIdFilter
    );

    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      message: "Error al listar registros emocionales",
      error: error.message,
    });
  }
};

const createForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = req.auth?.sub;
    
    // CORRECCIÓN: Cambiado de emotionalStateId a emotional_state_id
    const { emotional_state_id } = req.body; 

    if (!authUserId || authUserId !== userId) {
      return res.status(403).json({
        message: "El usuario autenticado no coincide con el usuario objetivo",
      });
    }

    // CORRECCIÓN: Validamos usando la variable correcta
    const parsedStateId = Number(emotional_state_id);
    if (!emotional_state_id || Number.isNaN(parsedStateId)) {
      return res.status(400).json({
        message: "Se requiere un emotional_state_id numérico en el cuerpo de la petición",
      });
    }

    const record = await emotionalRecordsService.createEmotionalRecord(userId, parsedStateId);

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar la emoción",
      error: error.message,
    });
  }
};

const getMonthlySummaryByUser = async (req, res) => {
  try {
    const { userId, month } = req.params;
    const { year } = req.query;

    if (!year || !/^\d{4}$/.test(year)) {
      return res.status(400).json({
        message: "Se requiere un año válido como query param: ?year=YYYY",
      });
    }

    const summary = await emotionalRecordsService.getMonthlySummaryByUser({
      userId,
      month,
      year,
    });

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener resumen mensual",
      error: error.message,
    });
  }
};

module.exports = {
  listByUser,
  createForUser,
  getMonthlySummaryByUser,
};
