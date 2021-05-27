import { 
	Entity,
	DbSet,
	RunContext,
	QueryUUID,
	QueryProxy,
	QueryString,
	QueryJSON,
	QueryTimeStamp,
	QueryNumber,
	QueryTime,
	QueryDate,
	QueryBoolean,
	QueryBuffer,
	ForeignReference,
	PrimaryReference
} from "vlquery";

export class OperationType {
	static readonly append = "append";
	static readonly createDirectory = "create_directory";
	static readonly createFile = "create_file";
	static readonly delete = "delete";
	static readonly write = "write";
}

export class LayerQueryProxy extends QueryProxy {
	get name(): Partial<QueryString> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get readKey(): Partial<QueryString> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get writeKey(): Partial<QueryString> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
}

export class Layer extends Entity<LayerQueryProxy> {
	$meta = {
		tableName: "layer",
		columns: {"id":{"type":"uuid","name":"id"},"name":{"type":"text","name":"name"},"readKey":{"type":"text","name":"read_key"},"writeKey":{"type":"text","name":"write_key"}},
		get set(): DbSet<Layer, LayerQueryProxy> {
			// returns unbound dbset
			return new DbSet<Layer, LayerQueryProxy>(Layer, null)
		},
		
	};
		
	constructor() {
		super();

		this.operations = new PrimaryReference<Operation, OperationQueryProxy>(
			this,
			"layerId",
			Operation
		);
	}

	operations: PrimaryReference<Operation, OperationQueryProxy>;
					
	name: string;
	readKey: string;
	writeKey: string;
}
			
export class OperationQueryProxy extends QueryProxy {
	get layer(): Partial<LayerQueryProxy> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
					
	get operation(): "append" | "create_directory" | "create_file" | "delete" | "write" {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get data(): Partial<QueryBuffer> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get date(): Partial<QueryTimeStamp> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get path(): Partial<QueryString> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
				
	get layerId(): Partial<QueryUUID> {
		throw new Error("Invalid use of QueryModels. QueryModels cannot be used during runtime");
	}
}

export class Operation extends Entity<OperationQueryProxy> {
	$meta = {
		tableName: "operation",
		columns: {"id":{"type":"uuid","name":"id"},"operation":{"type":"operation_type","name":"operation"},"data":{"type":"bytea","name":"data"},"date":{"type":"timestamp","name":"date"},"path":{"type":"text","name":"path"},"layerId":{"type":"uuid","name":"layer_id"}},
		get set(): DbSet<Operation, OperationQueryProxy> {
			// returns unbound dbset
			return new DbSet<Operation, OperationQueryProxy>(Operation, null)
		},
		
	};
		
	constructor() {
		super();

		this.$layer = new ForeignReference<Layer>(
			this,
			"layerId",
			Layer
		);
	}

	private $layer: ForeignReference<Layer>;

	get layer(): Partial<ForeignReference<Layer>> {
		return this.$layer;
	}

	set layer(value: Partial<ForeignReference<Layer>>) {
		if (value) {
			if (!value.id) {
				throw new Error("Invalid null id. Save the referenced model prior to creating a reference to it.");
			}

			this.layerId = value.id;
		} else {
			this.layerId = null;
		}
	}
					
	operation: OperationType;
	data: Buffer;
	date: Date;
	path: string;
	layerId: string;
}
			

export class db {
	static layer: DbSet<Layer, LayerQueryProxy> = new DbSet<Layer, LayerQueryProxy>(Layer);
	static operation: DbSet<Operation, OperationQueryProxy> = new DbSet<Operation, OperationQueryProxy>(Operation);

	static findSet(modelType) {
		for (let key in this) {
			if (this[key] instanceof DbSet) {
				if ((this[key] as any).modelConstructor == modelType) {
					return this[key];
				}
			}
		}
	}
};