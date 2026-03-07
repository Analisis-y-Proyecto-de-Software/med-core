const healthService = require("../services/healthService");

const getHelloWorld = (_req, res) => {
  return res.status(200).json({
    message: "Hola mundo",
  });
};

const getHealth = async (_req, res) => {
  try {
    const status = await healthService.getHealthStatus();

    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Could not retrieve health status",
      error: error.message,
    });
  }
};

module.exports = {
  getHelloWorld,
  getHealth,
};
