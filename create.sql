Create Table If Not Exists people (
	id Integer Primary Key AUTOINCREMENT,
	name String Unique,
	email String Unique,
	password String,
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

Create Table If Not Exists score (
	player String,
	win Integer
	);

Create Table if Not Exists games (
	time Datetime,
	player String
	);

Create Table if Not Exists request (
	ident Integer Primary Key AUTOINCREMENT,
	sendTo String,
	winner String,
	looser String
	);
