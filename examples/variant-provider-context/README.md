## Description
In this example, a company has shopping cart. It is currently pink. The stake holders wants to go 
for a more corporate look, and they think the cart should be either black or white. "Product" thinks
that the stake holders are stupid and that the cart should remain glowing pink.

They decide to run an experiment to test different cart variants and then measure conversions. They
setup 3 variants. The control which is the current sickly pink, and two more variants, boring white
and crying out loud black. They will give the variant service the experiment name and customer id, 
and the variant service will always give the same variant to the same id.

In this implementation, we will run a server. The server will accept costumer id rest param.
It will initially assign a random variant to the id, but after the initial assignment, it wil always
return the same variant.

### How to run the server
On your terminal write:

`node ./examples/variant-provider-context [PORT]`

The path is a relative path from ABSee root. The port should be the port you wish to use. You do not
need to specify the port. The default value is 8080.

Once you have the server running you should see:

`Server listening on: http://localhost:8080` (or whichever port you set)

You can now make calls to the server. Either do it from a browser, or from another terminal.

`curl localhost:[PORT]/customer-id/[SomeId]`

example:

`curl localhost:8080/customer-id/12345`

The response, based on a variant, should be something like this:

```
The live experiments:
[{"experimentName":"ShoppingCartColor","variantName":"WhiteShoppingCart","customerId":"12345"}]
The experiment state:
{"shoppingCartColor":"rgb(255, 255, 255)"}
```