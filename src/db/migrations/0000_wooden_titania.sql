CREATE TABLE "image" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_url" varchar NOT NULL,
	"added_at" timestamp NOT NULL,
	"downloaded_at" timestamp,
	"local_path" varchar
);
