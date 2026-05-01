const { testConnection } = require("./postgresClient");

const getHealthStatus = async () => {
  const response = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "not_configured",
  };

  const result = await testConnection();

  response.database = result.success ? "connected" : "error";

  if (!result.success) {
    response.databaseError = result.error;
  }

  return response;
};

module.exports = {
  getHealthStatus,
};
