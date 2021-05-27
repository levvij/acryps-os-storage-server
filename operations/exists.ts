import { db, Operation, OperationType } from "../context";

const csd64 = require("csd64");

export function ExistsOperationHandler(app) {
	app.post("/exists", async (req, res) => {
		const path = req.headers["x-aoss-path"];
		const key = req.headers["x-aoss-key"];
		const layerId = req.headers["x-aoss-layer"];

		if (path == "/") {
			return res.json(true);
		}
	
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

		res.json(!!(await layer.operations.includeTree({ id: true }).first(o => o.path == path && (
			o.operation == OperationType.createDirectory ||
			o.operation == OperationType.createFile
		))));
	});
}