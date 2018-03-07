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

# Step 4

In this step we'll add load shedding capabilities to our configuration. Until
now we've been running `wrk` with a single thread a concurrency level of 1. This
matches up well with our python service, which is single threaded. Let's try
upping the thread count to 10 and the concurrency level to 10 by running

`wrk -c 10 -t 10 --latency -d 5s http://localhost:8000/service/1`

```console
Running 5s test @ http://localhost:8000/service/1
  10 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   471.00ms  345.43ms   1.47s    80.60%
    Req/Sec     2.72      1.12     9.00     86.84%
  Latency Distribution
     50%  310.00ms
     75%  311.54ms
     90%    1.00s 
     99%    1.46s 
  114 requests in 5.04s, 17.54KB read
  Non-2xx or 3xx responses: 110
Requests/sec:     22.62
Transfer/sec:      3.48KB
```

Our output here is pretty grim. We made 114 requests, and all but 4 of them
failed. In addition, our 99th percentile latency has jumped to 1.46 seconds, and
the median is up to 310 ms. We're not only failing a lot of requests, we're
taking a long time to do so. In addition, imagine that all our POST requests are
important (e.g. they're used to make a purchase). In this case those POST
requests have to wait behind a flood of GET requests, and the vast majority will
fail.

Envoy provides circuit breakers and priority routes to manage load shedding. In
this step we've added a new service instance to our Docker Compose file, so we
can reserve at least one for high priority requests.

We've also set the priority of the route that handles POST requests to high

```diff
                       value: "POST"
                 route:
                   cluster: service1
+                  priority: HIGH
                 decorator:
                   operation: updateAvailability
               - match:
```

And we've added circuit breaker definitions to the service1 cluster


```diff
     type: strict_dns
     lb_policy: round_robin
     http2_protocol_options: {}
+    circuit_breakers:
+      thresholds:
+        - priority: DEFAULT
+          max_connections: 1
+          max_requests: 1
+        - priority: HIGH
+          max_connections: 2
+          max_requests: 2
     hosts:
     - socket_address:
         address: service1
         port_value: 80
+    - socket_address:
+        address: service1a
+        port_value: 80
```

Shut down your example, if needed by running

`docker-compose down --remove-orphans`

in the `zipkin-tracing` directory, and then start your example again by running

`docker-compose up --build -d`

Run wrk with

`wrk -c 10 -t 10 --latency -d 5s http://localhost:8000/service/1`

and you should see results like

```console
Running 5s test @ http://localhost:8000/service/1
  10 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.68ms   11.38ms 103.72ms   91.48%
    Req/Sec   443.27    292.13     1.68k    75.00%
  Latency Distribution
     50%    1.80ms
     75%    3.95ms
     90%   13.41ms
     99%   57.06ms
  22122 requests in 5.03s, 4.58MB read
  Non-2xx or 3xx responses: 22037
Requests/sec:   4402.34
Transfer/sec:      0.91MB
```

We're still failing a lot of requests, but our latency is back down to normal
levels. Envoy is using circuit breakers to return 502s immediately instead of
waiting on the service to handle them. This leaves capacity on the servers to
handle high priority requests. If you attempt a POST request while running work
it will succeed.

To proceed to the next step run `git checkout step5`.
