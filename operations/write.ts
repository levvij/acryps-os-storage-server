import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function WriteOperationHandler(app) {
	app.post("/write", async (req, res) => {
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

		const priorWrites = await layer.operations
			.includeTree({ 
				id: true, 
				operation: true 
			})
			.where(o => (
				o.operation == OperationType.createFile || 
				o.operation == OperationType.write || 
				o.operation == OperationType.append) && o.path == path
			)
			.toArray();
	
		if (priorWrites.length) {
			for (let priorWrite of priorWrites) {
				if (priorWrite.operation == OperationType.createFile) {
					priorWrite.data = null;

					await priorWrite.update();
				} else {
					await priorWrite.delete();
				}
			}

			operation.operation = OperationType.write
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