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

module.exports = {
  listByUser,
};
