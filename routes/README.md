# Routing

All the routing for the basic ping-pong server is done through index.js. All GET and POST requests along with database querying is handled here.

User authentication and tracking is done using passport. Local user work is handled by passport-local. User authentication with OpenID is currently not supported, but will be integrated some time soon. 
Passwords are not saved in plane text. They are first processed through bcrypte-nodejs and saved as a hash with the basic salt/hash algorithm. 
To login remotely make a POST request to /login with req.body.password and req.body.username populated. The server will respond with either a redirect to /login if there is a failure or will populate req.user
Passport keeps tracked on users through req.user

Once you are logged in and have a correctly 
