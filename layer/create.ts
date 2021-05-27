import { Layer } from "../context";
const csd64 = require("csd64");

export function CreateLayerHandler(app) {
	app.post("/layer", async (req, res) => {
		const name = req.headers["x-aoss-name"];
	
		if (!name) {
			return res.status(500).send({
				error: "No name provided!"
			});
		}
	
		const readPrivateKey = csd64(Math.random().toString());
		const writePrivateKey = csd64(Math.random().toString());
	
		const layer = new Layer();
		layer.name = name;
		layer.readKey = csd64(readPrivateKey);
		layer.writeKey = csd64(writePrivateKey);
	
		await layer.create();
		
		res.json({
			id: layer.id,
			keys: {
				read: readPrivateKey,
				write: writePrivateKey
			}
		});
	});
}