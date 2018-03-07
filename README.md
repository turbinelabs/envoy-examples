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

We highly recommend you start with step1.

# Step 6

In the last step we used header based routing to deploy a new service version
before releasing it. In this step we'll execute an incremental release. We can
leave our header-based routing in place, but add a new match rule that will
activate 25% of the time. The `runtime` object in the route match tells Envoy to
roll a 100 sided die, and if the result is less than the value of the runtime
key (we default it to 25 here), then activate the match. By routing to a
different cluster in this match, we can send a percentage of traffic to our new
version.

```diff
                     retry_on: 5xx
                     num_retries: 3
                     per_try_timeout: 0.300s
+              - match:
+                  prefix: "/"
+                  runtime:
+                    default_value: 25
+                    runtime_key: routing.traffic_shift.helloworld
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

Now if we make a request to our service with no headers we should see responses
from service 1a about 25% of the time.

# Wrapup

This touches on a number of Envoy traffic control features, but you can go much
deeper. Our product, [Houston](https://www.turbinelabs.io/product) provides a UI
for configuring routes, along with a dashboard that lets you ensure that your
changes haven't impacted customers.

There's also [video of a talk](https://www.youtube.com/watch?v=OZhLrTFiMs8) I
gave on these examples, as well
as
[slides](https://www.slideshare.net/MarkMcBride11/traffic-control-with-envoy-proxy). If
you have any questions, let me know, mark@turbinelabs.io, or @mccv on Twitter.

