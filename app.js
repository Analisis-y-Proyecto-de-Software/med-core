const express = require("express");
const cors = require("cors");

const healthRoutes = require("./src/routes/healthRoutes");
const healthController = require("./src/controllers/healthController");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", healthController.getHelloWorld);

app.use("/api", healthRoutes);

module.exports = app;
