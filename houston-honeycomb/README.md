# Houston demo with docker-compose

To execute this you'll need 

   * a Houston API key
   * a working docker-compose install
   * a Rotor version greater than 0.18.2
   * a [https://www.honeycomb.io/](Honeycomb) write key and dataset

Set the following environment variables

```console
export ROTOR_API_KEY=<your signed token>
export ROTOR_API_ZONE_NAME=<the zone you want to create>
export HONEYCOMB_WRITE_KEY=<your honeycomb write key>
export HONEYCOMB_DATASET=<your hoenycomb dataset name>
```

Run the following to create your Houston zone with appropriate routes

```console
tbnctl init-zone --routes=localhost:80/=client --routes=localhost:80/api=server --proxies=front-proxy=localhost:80 $ROTOR_API_ZONE_NAME
```

define a listener in the file listener.json

```json
{
  "zone_key": "<your zone key>",
  "name": "front-proxy-listener",
  "ip": "0.0.0.0",
  "port": 80,
  "protocol": "http_auto",
  "tracing_config": {
    "ingress": true
  }
}
```

```console
cat listener.json | tbnctl create listener
```

link listener to proxy

```console
tbnctl edit proxy <your proxy key>
```

add the listener key

```json
 {
    "proxy_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "zone_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "name": "front-proxy",
    "domain_keys": [
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ],
    "listener_keys": [
      "<your listener key>"
    ],
    "listeners": null,
  }
```

Next run the following to launch all the containers

```console
docker-compose up
```

Now you should be able to go to http://localhost to see our all-in-one demo running
