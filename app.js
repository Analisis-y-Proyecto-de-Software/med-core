const express = require("express");
const cors = require("cors");

const healthRoutes = require("./src/routes/healthRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Hola mundo",
  });
});

app.use("/api", healthRoutes);

module.exports = app;
