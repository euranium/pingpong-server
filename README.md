# pingpong-server
WWU CS ping pong server

To start on a local machine, simply run `npm start`, running the start script with `./start` will complete this task. To install all the required packages run `npm install`. 

This server is build with and tested with node version 0.12.0 running express 4.11. The server stores all information on an Sqlite3 database. 
Any server that this is run on must have Sqlite3 installed seperatly. The server is also build using Ubuntu 14.14. 

Checkout Router README for more information on how this app handles GET and POST requests.

## TODO
-[ ] Set up third party user authentication
	-[ ] authentication through google
	-[ ] authentication through facebook
	-[ ] authentication through github
	-[ ] authentication through twitter
-[ ] Set up ranking system
	-[ ] set up elo system
	-[ ] set up relative ranking
	-[ ] set up lader system
-[ ] Set up game wanted sytem
	-[ ] make form for a game
	-[ ] delete old requests
	-[ ] page to query requests
-[ ] Remove old users/ poeple no longer using system
-[ ] ???
    -[ ] Profit
