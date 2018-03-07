# Envoy Traffic Control Examples

# Overview

This repository is organized such that each commit adds more sophistication to
the
[zipkin-tracing from the Envoy repository](https://github.com/envoyproxy/envoy/tree/master/examples/zipkin-tracing).
Each step is tagged, so you can set the repository to a given step with

`git checkout step<n>`, e.g. `git checkout step1`.

The Envoy documentation provides a good overview of
[how to run the example](https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/zipkin_tracing). 

We'll also use [wrk](https://github.com/wg/wrk)
and [curl](https://curl.haxx.se/) to drive load against our services.

# Step 5

Request routing is another powerful traffic control tool that Envoy provides. In
this example we'll create a second cluster to represent a new version of our
service. 

```diff
     - socket_address:
         address: service1
         port_value: 80
+  - name: service1a
+    connect_timeout: 0.250s
+    type: strict_dns
+    lb_policy: round_robin
+    http2_protocol_options: {}
+    circuit_breakers:
+      thresholds:
+        - priority: DEFAULT
+          max_connections: 1
+          max_requests: 1
+        - priority: HIGH
+          max_connections: 2
+          max_requests: 2
+    hosts:
     - socket_address:
         address: service1a
         port_value: 80
```

Then we'll add routing rule that lets us test the new version of that
service by including an HTTP header.

```diff
                   priority: HIGH
                 decorator:
                   operation: updateAvailability
+              - match:
+                  prefix: "/"
+                  headers:
+                    - name: "x-canary-version"
+                      value: "service1a"
+                route:
+                  cluster: service1a
+                  retry_policy:
+                    retry_on: 5xx
+                    num_retries: 3
+                    per_try_timeout: 0.300s
               - match:
                   prefix: "/"
                 route:
```


Shut down your example, if needed by running

`docker-compose down --remove-orphans`

in the `zipkin-tracing` directory, and then start your example again by running

`docker-compose up --build -d`

If we make a request to our service with no headers, you'll get a response from
service 1.

```console
> curl localhost:8000/service/1
Hello from behind Envoy (service 1)! hostname: d0adee810fc4 resolvedhostname: 172.18.0.2
```

However if we include the `x-canary-version` header, Envoy will route our
request to service 1a.

```console
> curl -H 'x-canary-version: service1a' localhost:8000/service/1
Hello from behind Envoy (service 1a)! hostname: 569ee89eebc8 resolvedhostname: 172.18.0.6
```

This is a powerful feature. It allows you to
[separate the deploy and release phases](https://blog.turbinelabs.io/deploy-not-equal-release-part-one-4724bc1e726b)
of your application, paving the way for canary releases and 
[testing in production](https://opensource.com/article/17/8/testing-production).

To proceed to the next step run `git checkout step6`.
