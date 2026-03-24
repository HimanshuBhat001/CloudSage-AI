const express = require("express");
const Docker = require("dockerode");

const router = express.Router();

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

router.get("/", async (req, res) => {

try {

const containers = await docker.listContainers();

const containerData = containers.map(container => ({
id: container.Id.substring(0,12),
name: container.Names[0].replace("/",""),
image: container.Image,
status: container.Status
}));

res.json(containerData);

} catch (error) {

console.error(error);
res.status(500).json({error:"Failed to fetch containers"});

}

});

module.exports = router;