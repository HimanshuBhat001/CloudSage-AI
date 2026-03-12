const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const os = require("os");

const authRoutes = require("./api/auth");
require("./config/db");

dotenv.config();

const app = express();

/* MIDDLEWARE */

app.use(cors());
app.use(express.json());

/* AUTH ROUTES */

app.use("/api/auth", authRoutes);

/* ROOT */

app.get("/", (req, res) => {
    res.send("CloudSage Backend Running");
});

/* SYSTEM STATUS */

app.get("/api/status", (req, res) => {

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpuLoad = os.loadavg()[0];

    res.json({
        server: "running",
        uptime: process.uptime(),
        platform: os.platform(),
        cpuCores: os.cpus().length,
        cpuLoad: cpuLoad.toFixed(2),
        totalMemory: (totalMem / 1024 / 1024 / 1024).toFixed(2),
        freeMemory: (freeMem / 1024 / 1024 / 1024).toFixed(2),
        usedMemory: (usedMem / 1024 / 1024 / 1024).toFixed(2)
    });

});

/* LOGS API */

app.get("/api/logs", (req, res) => {

    const logs = [
        "Server started",
        "Database connected",
        "User login successful",
        "Metrics requested",
        "Dashboard refreshed"
    ];

    res.json(logs);

});

/* ALERTS API */

app.get("/api/alerts",(req,res)=>{

    const alerts=[
        {message:"Memory usage above 80%",level:"warning"},
        {message:"Server-2 CPU above 90%",level:"critical"},
        {message:"Server-3 unreachable",level:"danger"}
    ];

    res.json(alerts);

});

/* MULTI SERVER API */

app.get("/api/servers", (req, res) => {

    const servers = [
        { name: "Server-1", cpu: 32, memory: 65, status: "running" },
        { name: "Server-2", cpu: 45, memory: 40, status: "running" },
        { name: "Server-3", cpu: 12, memory: 22, status: "running" }
    ];

    res.json(servers);

});

/* START SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});