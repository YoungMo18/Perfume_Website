CREATE TABLE "perfumes" (
	"perfume_id"	INTEGER,
	"name"	TEXT,
	"price"	REAL,
	"quantity"	NUMERIC,
	"size" NUMERIC,
	"description"	TEXT,
	"company"	TEXT,
	PRIMARY KEY("perfume_id" AUTOINCREMENT)
)

CREATE TABLE "purchase_history" (
	"purchase_id"	TEXT,
	"user_id"	INTEGER,
	"perfume_id"	INTEGER,
	"quantity"	INTEGER,
	"date"	DATETIME DEFAULT (datetime('now', 'localtime')),
	"id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("perfume_id") REFERENCES "perfumes"("perfume_id")
)

CREATE TABLE "users" (
	"user_id"	INTEGER,
	"username"	TEXT,
	"password"	TEXT,
	"email"	TEXT,
	PRIMARY KEY("user_id" AUTOINCREMENT)
)

CREATE TABLE "cart" (
	"perfume_id"	INTEGER,
	"quantity"	INTEGER,
	"id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("perfume_id") REFERENCES "perfumes"("perfume_id")
)
