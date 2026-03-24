exports.getDashboard = (req, res) => {

res.json({
cpu: "35%",
memory: "60%",
network: "120MB/s",
instances: "3 running"
})

}