const express = require("express");
const cors = require("cors");

const healthRoutes = require("./src/routes/healthRoutes");
const healthController = require("./src/controllers/healthController");
const emotionalRecordsRoutes = require("./src/routes/emotionalRecordsRoutes");
const tasksRoutes = require("./src/routes/tasksRoutes");
const chartsRoutes = require("./src/routes/chartsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", healthController.getHelloWorld);

app.use("/api", healthRoutes);
app.use("/api", emotionalRecordsRoutes);
app.use("/", emotionalRecordsRoutes);
app.use("/", tasksRoutes);
app.use("/", chartsRoutes);

module.exports = app;