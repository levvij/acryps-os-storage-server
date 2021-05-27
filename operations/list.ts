import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function ListOperationHandler(app) {
	app.post("/list", async (req, res) => {
		const path = req.headers["x-aoss-path"];
		const key = req.headers["x-aoss-key"];
		const layerId = req.headers["x-aoss-layer"];
	
		if (!path) {
			return res.status(500).send({
				error: "No path provided!"
			});
		}
	
		if (!layerId) {
			return res.status(500).send({
				error: "No layer provided!"
			});
		}
	
		const layer = await db.layer.find(layerId);
	
		if (!layer) {
			return res.status(500).send({
				error: "Layer not found!"
			});
		}
	
		if (!key || layer.readKey != csd64(key)) {
			return res.status(500).send({
				error: "Invalid read key!"
			});
		}

		const files = [];

		for (let file of await layer.operations.includeTree({ 
			path: true
		}).where(o => o.path.startsWith(path) && (
			o.operation == OperationType.createFile || 
			o.operation == OperationType.createDirectory
		)).toArray()) {
			if (!file.path.replace(path, "").includes("/") || !file.path.replace(path, "").split("/")[1]) {
				files.push(file.path);
			}
		}

		res.json(files);
	});
}