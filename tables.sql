CREATE TABLE "books" (
	"book_id"	INTEGER,
	"name"	TEXT,
	"price"	REAL,
	"quantity"	NUMERIC,
	"description"	TEXT,
	"genres"	TEXT,
	"author"	TEXT,
	PRIMARY KEY("book_id" AUTOINCREMENT)
);

CREATE TABLE "purchase_history" (
	"purchase_id"	TEXT,
	"user_id"	INTEGER,
	"book_id"	INTEGER,
	"quantity"	INTEGER,
	"date"	DATETIME DEFAULT (datetime('now', 'localtime')),
	"id"	INTEGER,
	PRIMARY KEY("id"),
	FOREIGN KEY("book_id") REFERENCES books(book_id)
);

CREATE TABLE "users" (
	"user_id"	INTEGER,
	"username"	TEXT,
	"password"	TEXT,
	"email"	TEXT,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);

CREATE TABLE "cart" (
	"book_i2"	INTEGER,
	"quantity"	INTEGER,
	"id"	INTEGER,
	FOREIGN KEY("book_id") REFERENCES "books"("book_id"),
	PRIMARY KEY("id")
);
