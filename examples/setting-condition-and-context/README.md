## Description
In this example, a web-site has a yellowish div. The powers that be want it to be purplish horror
for logged in users. The developers are insisting that greenish yuck is the best way to go. An
experiment has been designed. When a client is logged in, have three variants: control, 
PurplishHorror and GreenishYuck. If a user is logged in, then the test will run.

The idea here is that the condition is - user logged in, and the context is customer-id.

### How to run the server
On your terminal write:

`node ./examples/variant-provider-context [PORT]`

The path is a relative path from ABSee root. The port should be the port you wish to use. You do not
need to specify the port. The default value is 8080.

Once you have the server running you should see:

`Server listening on: http://localhost:8080` (or whichever port you set)

Now go to a browser, and go to url: `localhost:8080`. You will see that there is no customer id, no
experiment, and no experiment state. Go to `localhost:8080/login`. This will create a cookie with a
client id. For that client id, you will always get the same variant (as long as the server is 
running). Every time you go to `login` you will get a new client id, and maybe a new variant.
Go to `localhost:8080/logout`. That will set the cookie value to ''. Now, becuase of the condition,
again no test is running, and no test will run until you log in again.