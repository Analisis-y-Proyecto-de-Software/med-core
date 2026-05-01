const healthService = require("../services/healthService");
const { testConnection } = require("../services/postgresClient");

const getHelloWorld = async (_req, res) => {
  const result = await testConnection();

  if (result.success) {
    return res.status(200).json({
      message: "conexion correcta",
    });
  } else {
    return res.status(500).json({
      message: "Error en la conexion",
      error: result.error,
    });
  }
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
