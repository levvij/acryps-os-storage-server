import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function AppendOperationHandler(app) {
	app.post("/append", async (req, res) => {
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
	
		const operation = new Operation();
	
		if (await layer.operations.includeTree({ id: true }).first(o => o.operation == OperationType.createFile && o.path == path)) {
			operation.operation = OperationType.append
		} else {
			operation.operation = OperationType.createFile
		}
	
		operation.date = new Date();
		operation.layer = layer;
		operation.path = path;
	
		// stream body
		const buffers = [];
	
		req.on("data", buffer => {
			buffers.push(buffer);
		});
	
		req.on("end", async () => { 
			operation.data = Buffer.concat(buffers);
	
			await operation.create();
	
			res.json(true);
		});
	});
}