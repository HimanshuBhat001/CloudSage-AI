const express = require("express");
const cors = require("cors");
const os = require("os");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

/* CPU HISTORY FOR ANOMALY DETECTION */
let cpuHistory = [];

/* ROOT ROUTE */

app.get("/", (req, res) => {
res.send("CloudSage Backend Running 🚀");
});


/* SERVER STATUS */

app.get("/api/status", (req, res) => {

const totalMem = os.totalmem() / 1024 / 1024 / 1024;
const freeMem = os.freemem() / 1024 / 1024 / 1024;
const usedMem = totalMem - freeMem;

const cpuLoad = os.loadavg()[0];

res.json({
server: os.hostname(),
platform: os.platform(),
cpuCores: os.cpus().length,
uptime: os.uptime(),
usedMemory: usedMem.toFixed(2),
freeMemory: freeMem.toFixed(2),
cpuLoad: cpuLoad.toFixed(2)
});

});


/* LOGS */

app.get("/api/logs", (req, res) => {

const logs = [
"CloudSage monitoring started",
"System metrics collected",
"Docker containers scanned",
"Memory usage normal",
"System operating normally"
];

res.json(logs);

});


/* DOCKER CONTAINER LIST */

app.get("/api/containers", (req, res) => {

exec(
'docker ps --format "{{.Names}}|{{.Image}}|{{.Status}}"',
(error, stdout) => {

if(error){
return res.json({containers:[]});
}

const containers = stdout
.trim()
.split("\n")
.filter(Boolean)
.map(line => {

const parts = line.split("|");

return {
name: parts[0],
image: parts[1],
status: parts[2]
};

});

res.json({containers});

});

});


/* CONTAINER CPU & MEMORY */

app.get("/api/containerStats", (req, res) => {

exec(
'docker stats --no-stream --format "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}"',
(error, stdout) => {

if(error){
return res.json({containers:[]});
}

const containers = stdout
.trim()
.split("\n")
.filter(Boolean)
.map(line => {

const parts = line.split("|");

return {
name: parts[0],
cpu: parts[1],
memory: parts[2]
};

});

res.json({containers});

});

});


/* AI ANALYSIS */

app.get("/api/analysis", (req, res) => {

const cpuLoad = os.loadavg()[0];
const totalMem = os.totalmem();
const freeMem = os.freemem();

const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

let analysis = [];

/* CPU ANOMALY DETECTION */

cpuHistory.push(cpuLoad);

if(cpuHistory.length > 10){
cpuHistory.shift();
}

const avgCpu =
cpuHistory.reduce((a,b)=>a+b,0) / cpuHistory.length;

if(cpuLoad > avgCpu * 1.5){
analysis.push("Unusual CPU spike detected");
}

/* MEMORY CHECK */

if(usedPercent > 80){
analysis.push("Memory usage above 80%");
}

/* CONTAINER HEALTH CHECK */

exec(
'docker ps -a --format "{{.Names}}|{{.Status}}"',
(error, stdout) => {

if(!error){

const lines = stdout.trim().split("\n");

lines.forEach(line => {

const parts = line.split("|");

const name = parts[0];
const status = parts[1];

if(status.includes("Exited")){
analysis.push(`Container ${name} has stopped`);
}

if(status.includes("Restarting")){
analysis.push(`Container ${name} is restarting repeatedly`);
}

if(status.includes("Restarting") || status.includes("Exited")){
analysis.push(`Possible crash loop detected for ${name}`);
}

});

}

if(analysis.length === 0){
analysis.push("All systems operating normally");
}

res.json({analysis});

});

});


/* START SERVER */

const PORT = 5000;

app.listen(PORT, () => {

console.log(`CloudSage backend running on port ${PORT}`);

});