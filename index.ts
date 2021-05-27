import { Layer, Operation, OperationType, db } from "./context";
import { DbClient } from "vlquery";
import { CreateLayerHandler } from "./layer/create";
import { WriteOperationHandler } from "./operations/write";
import { ReadOperationHandler } from "./operations/read";
import { AppendOperationHandler } from "./operations/append";
import { CreateDirectoryOperationHandler } from "./operations/create-directory";
import { ExistsOperationHandler } from "./operations/exists";
import { ListOperationHandler } from "./operations/list";
import { readFileSync } from "fs"; 

const express = require("express");
const app = express();

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");

	console.log(`[aoss]\trequest ${req.originalUrl}`);

	next();
});

CreateLayerHandler(app);
WriteOperationHandler(app);
ReadOperationHandler(app);
AppendOperationHandler(app);
CreateDirectoryOperationHandler(app);
ExistsOperationHandler(app);
ListOperationHandler(app);

app.get("/next", (req, res) => {
	const endpoints = (process.env.AOSS_NEXT_ENDPOINTS || "").split(",");

	res.json(endpoints[Math.floor(endpoints.length * Math.random())]);
});

app.get("*", (req, res) => {
	res.json({
		version: JSON.parse(readFileSync(`${__dirname}/../package.json`).toString()).version,
		env: process.env.CLUSTER_ENV
	});
});

DbClient.connectedClient = new DbClient();
DbClient.connectedClient.connect().then(() => {
	app.listen(process.env.PORT);

	console.log(`[aoss]\tstarted on ${process.env.PORT}`);
})