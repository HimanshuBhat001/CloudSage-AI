const token = localStorage.getItem("token");

if(!token){
window.location.href="login.html";
}

let memoryChart;
let cpuChart;

let cpuHistory=[];
let labels=[];

async function loadStatus(){

const response=await fetch("http://localhost:5000/api/status");
const data=await response.json();

document.getElementById("serverStatus").innerText=data.server;
document.getElementById("platform").innerText=data.platform;
document.getElementById("cpu").innerText=data.cpuCores;
document.getElementById("uptime").innerText=Math.floor(data.uptime)+" sec";

const usedMem=parseFloat(data.usedMemory);
const freeMem=parseFloat(data.freeMemory);
const cpuLoad=parseFloat(data.cpuLoad);

const usedPercent=(usedMem/(usedMem+freeMem))*100;

if(usedPercent>80){
document.getElementById("alertBox").style.display="block";
}else{
document.getElementById("alertBox").style.display="none";
}

if(!memoryChart){

memoryChart=new Chart(document.getElementById("memoryChart"),{
type:"doughnut",
data:{
labels:["Used","Free"],
datasets:[{
data:[usedMem,freeMem],
backgroundColor:["red","green"]
}]
}
});

}else{

memoryChart.data.datasets[0].data=[usedMem,freeMem];
memoryChart.update();

}

const time=new Date().toLocaleTimeString();

cpuHistory.push(cpuLoad);
labels.push(time);

if(cpuHistory.length>12){
cpuHistory.shift();
labels.shift();
}

if(!cpuChart){

cpuChart=new Chart(document.getElementById("cpuChart"),{
type:"line",
data:{
labels:labels,
datasets:[{
label:"CPU Load",
data:cpuHistory,
borderColor:"cyan",
fill:false
}]
}
});

}else{

cpuChart.data.labels=labels;
cpuChart.data.datasets[0].data=cpuHistory;
cpuChart.update();

}

}

async function loadLogs(){

const response=await fetch("http://localhost:5000/api/logs");
const logs=await response.json();

const box=document.getElementById("logsBox");
box.innerHTML="";

logs.forEach(log=>{
const p=document.createElement("p");
p.innerText=log;
box.appendChild(p);
});

}

async function loadServers(){

const response=await fetch("http://localhost:5000/api/servers");
const servers=await response.json();

const box=document.getElementById("serversBox");
box.innerHTML="";

servers.forEach(server=>{

const div=document.createElement("div");
div.className="serverCard";

div.innerHTML=`
<b>${server.name}</b><br>
CPU: ${server.cpu}%<br>
Memory: ${server.memory}%<br>
Status: ${server.status}
`;

box.appendChild(div);

});

}

async function loadAlerts(){

const response=await fetch("http://localhost:5000/api/alerts");
const alerts=await response.json();

const box=document.getElementById("alertsBox");
box.innerHTML="";

alerts.forEach(alert=>{

const div=document.createElement("div");

div.style.background="#1e293b";
div.style.padding="10px";
div.style.marginBottom="10px";
div.style.borderRadius="6px";

div.innerHTML=`⚠ ${alert.message}`;

box.appendChild(div);

});

}

async function loadContainers(){

const res = await fetch("http://localhost:5000/api/containers");
const data = await res.json();

const box = document.getElementById("containerBox");

if(!box) return;

box.innerHTML="";

data.containers.forEach(container=>{

const div=document.createElement("div");
div.className="serverCard";

div.innerHTML=`
<b>${container.name}</b><br>
Image: ${container.image}<br>
Status: ${container.status}
`;

box.appendChild(div);

});

}


async function loadAnalysis(){

const res = await fetch("http://localhost:5000/api/analysis");
const data = await res.json();

const box=document.getElementById("analysisBox");

if(!box) return;

box.innerHTML="";

data.analysis.forEach(issue=>{

const div=document.createElement("div");
div.className="serverCard";

div.innerText=issue;

box.appendChild(div);

});

}

function logout(){

localStorage.removeItem("token");
window.location.href="login.html";

}

loadStatus();
loadLogs();
loadServers();
loadAlerts();
loadContainers();
loadAnalysis();

setInterval(loadStatus,5000);
setInterval(loadLogs,10000);
setInterval(loadServers,10000);
setInterval(loadAlerts,10000);
setInterval(loadContainers,10000);
setInterval(loadAnalysis,10000);