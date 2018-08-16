# Houston demo with docker-compose

To execute this you'll need 

   * a Houston API key
   * a working docker-compose install

Set the following environment variables

```console
export ROTOR_API_KEY=<your signed token>
export ROTOR_API_ZONE_NAME=<the zone you want to create>
```

Run the following to create your Houston zone with appropriate routes

```console
tbnctl init-zone --routes=localhost:80/=client --routes=localhost:80/api=server --proxies=front-proxy=localhost:80 $ROTOR_API_ZONE_NAME
```

Next run the following to launch all the containers

```console
docker-compose up
```

Now you should be able to go to http://localhost to see our all-in-one demo running
