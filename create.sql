Create Table If Not Exists people (
	name String Primary Key,
	email String
	password String
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
	winner String,
	second String
	);
