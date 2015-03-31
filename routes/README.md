# Routing

All the routing for the basic ping-pong server is done through index.js. All GET and POST requests along with database querying is handled here.

## Authentication
User authentication and tracking is done using Passport. Local user work is handled by passport-local. User authentication with OpenID is currently not supported, but will be integrated some time soon. For more information on Passport check out their (somewhat sparse) [documentation] (http://passportjs.org/).
Passwords are not saved in plain text. They are first processed through bcrypte-nodejs and saved as a hash with the basic salt/hash algorithm.
To login remotely make a POST request to /login with req.body.password and req.body.username should be populated with the correct information. The server will respond with either a redirect to /login if there is a failure or will populate req.user
Passport keeps track of users through req.user

## Users
Once you are logged in and have a correctly assigned req.user, you can access /profile and /games. Each call to said directory will use Passport's built in login checker, which checks req.user.
If there is no authentic req.user you will be redirected to the login page. I use req.isAuthenticated with Passport.
Visiting /profile will return the the number of wins, looses, player elo (still in process), any match requests, and match history.

## Match Requests
Match requests are requests to log a game that has happened. To submit a request you must be logged in.
You will then submit a POST request with the name of the user you are sending the request to, the winner of the game and the loser.
The request will be logged into the database with a unique identification number.
The player logged in cannot send the request to themselves. They must be a winner or loser, and must send the request to a valid user.
If the request is not valid, the form page will be rendered and sent again with the error. Else, the page will be rendered with a success tag.

Users accept or reject a match request on their /profile page. To reject a form, send a POST request to /profile with req.body.reject= 'reject' and the req.body.id = request id.
You cannot reject and accept a match. Rejecting a match automatically deletes the request. To accept a request send a POST request with requ.body.accept='accept' and req.body.id= request id.
The server will confirm that the id is valid and increments the winner and loser's win/loss value appropriately. 
