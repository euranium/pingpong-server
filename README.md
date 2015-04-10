# pingpong-server
WWU CS ping pong server

To start on a local machine, simply run `npm start`, running the start script with `./start` will complete this task. To install all the required packages run `npm install`.

This server is built and tested with node version 0.12.0 running express 4.11. Check out package.json for dependency information. The server stores all information on an Sqlite3 database.
Any server that this is run on must have Sqlite3 installed seperatly. The server is also built and tested on Ubuntu 14.14 and MacOS 10.10.2

**Note:** there may be some problems with Sqlite3 when porting between GNU/Linux and MacOS. If there is a problem running the Sqlite3 module, run `npm install sqlite3` to reinstall.

Checkout Router README for more information on how this app handles GET and POST requests.

## TODO
Feel free to help out with any of these (pull request anyone?)
- [ ] Set up third party user authentication with passport and OAuth
	- [ ] authentication through google
	- [ ] authentication through facebook
	- [ ] authentication through github
	- [ ] authentication through twitter
- [ ] Set up ranking system
	- [x] set up elo system
	- [ ] set up relative ranking
	- [ ] set up ladder system
- [ ] Set up game wanted sytem
	- [ ] make form for a game
	- [ ] delete old requests
	- [ ] page to query requests
- [ ] Set up user setting
	- [ ] add password reset
	- [ ] add email verification
- [ ] Remove old users / poeple no longer using system
- [ ] Make sure there are no breaking changes with future, updates,  dependency updates
- [ ] ???
    - [ ] Profit

## Cloning and Running
run `git clone https://github.com/euranium/pingpong-server && cd pingpong-server && npm start`

## Authors
Rainier Harvey
	contact at rainierharvey@gmail.com

## About
This project was started for the WWU computer science department. It's pupose is to keep track of students wins and loses at ping pong played in CF 405.
This is primarily for entertainment puposes.

## licensing
Read LICENSE
