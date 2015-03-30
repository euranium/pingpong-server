# Routing

All the routing for the basic ping-pong server is done through index.js. All GET and POST requests along with database querying is handled here.

User authentication and tracking is done using passport. Local user work is handled by passport-local. User authentication with OpenID is currently not supported, but will be integrated some time soon.
Passwords are not saved in plane text. They are first processed through bcrypte-nodejs and saved as a hash with the basic salt/hash algorithm.
To login remotely make a POST request to /login with req.body.password and req.body.username populated. The server will respond with either a redirect to /login if there is a failure or will populate req.user
Passport keeps tracked on users through req.user

## Users
Once you are logged in and have a correctly assigned req.user, you can access /profile and /games. Each call to said directory will use passports build in login checker, which checks for req.user.
If there is no authentic req.user you will be redirected to the login page.
Visiting /profile will return the the number of win, looses, player elo (still in process), any match requests and match history.

## Match Requests
Match requests are requests to log a game that has happened. To sumit a request you must be loged in and to to /games or /games/log.
You will then submit a POST request with the name of the user you are sending the request to, the winner of the game and the looser. 
The player logged in cannot send the request to themselves, they must be a winner or looser, and must send the request to a valid user.
If the request is not valid, the form page will be rendered and sent again with the error. Else, the page will be rendered with a success tag.

Users accept or reject a match request on their /profile page. To reject a form, send a POST request to /profile with req.body.reject= 'reject' and the req.body.id = request id.
You cannot reject and accept a match. Rejecting a match automatically deletes the request. To accept a request send a POST request with requ.body.accept='accept' and req.body.id= request id.
The server confirms the id is valid and increments the winner and looser's win/loss value appropriately. 
