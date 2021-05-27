CREATE extension "uuid-ossp";

CREATE TABLE layer (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	name TEXT,

	read_key TEXT,
	write_key TEXT
);

CREATE TYPE operation_type AS ENUM (
	'create_directory',
	'create_file', 
	'write',
	'append',
	'delete'
);

CREATE TABLE operation (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

	operation operation_type,
	data BYTEA,
	date TIMESTAMP,
	path TEXT,

	layer_id UUID CONSTRAINT layer__operations REFERENCES layer(id),

	read_key TEXT,
	write_key TEXT
);