Create Table If Not Exists people (
	id Integer Primary Key AUTOINCREMENT,
	name String Unique,
	email String Unique,
	password String,
	admin String,
	elo Integer,
	win Integer,
	loss Integer
	);
Create Table If Not Exists facebook(
	id String,
	token String,
	email String,
	name String
	);

Create Table If Not Exists twitter (
	id String,
	token String,
	displayName String,
	username String
	);

Create Table If Not Exists google (
	id String,
	token String,
	email String,
	name String
	);

Create Table If Not Exists history (
	win String,
	lose String,
	time Datetime
	);

Create Table if Not Exists games (
	time Datetime,
	player String
	);

Create Table if Not Exists request (
	ident Integer Primary Key AUTOINCREMENT,
	sendTo String,
	winner String,
	loser String
	);

Create Table if Not Exists gamers (
	id Integer Primary Key AUTOINCREMENT,
	name String Unique
	);

Create Table if Not Exists match (
	id Integer Primary Key AUTOINCREMENT,
	game String,
	players String
	);
