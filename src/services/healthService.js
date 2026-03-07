const { supabase } = require("./supabaseClient");

const getHealthStatus = async () => {
  const response = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "not_configured",
  };

  if (!supabase) {
    return response;
  }

  const { error } = await supabase.auth.getSession();

  response.database = error ? "error" : "connected";

  if (error) {
    response.databaseError = error.message;
  }

  return response;
};

module.exports = {
  getHealthStatus,
};
