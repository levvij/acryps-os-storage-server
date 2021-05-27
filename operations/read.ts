import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function ReadOperationHandler(app) {
	app.post("/read", async (req, res) => {
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
	
		const buffers = [];
		let hasOperation;
	
		for (let operation of await layer.operations.where(o => o.path == path && (
			o.operation == OperationType.createFile || 
			o.operation == OperationType.write || 
			o.operation == OperationType.append
		)).orderByAscending(e => e.date).toArray()) {
			hasOperation = true;

			if (operation.data) {
				buffers.push(operation.data);
			}
		}

		if (hasOperation) {
			res.send(Buffer.concat(buffers));
		} else {
			res.status(204).send({
				next: true
			});
		}
	});
}