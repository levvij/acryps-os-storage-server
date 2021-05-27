import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function CreateDirectoryOperationHandler(app) {
	app.post("/directory", async (req, res) => {
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
	
		if (!key || layer.writeKey != csd64(key)) {
			return res.status(500).send({
				error: "Invalid write key!"
			});
		}

		for (let priorDelete of await layer.operations.where(o => o.path == path && o.operation == OperationType.delete).toArray()) {
			await priorDelete.delete();
		}
	
		const operation = new Operation();
		operation.operation = OperationType.createDirectory;
		operation.date = new Date();
		operation.layer = layer;
		operation.path = path;

		await operation.create();

		res.json({});
	});
}