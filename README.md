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

# Step 3

In this step we modify our retry policy to not affect POST requests. POST
request tend to modify state, and are generally unsafe to retry. By adding a new
match rule to the `zipkin-tracing/front-envoy-zipkin.yml` file we can cause
POSTs to have no retry policy, but leave the existing retry policy in place for
all other requests.

```diff
+              - match:
+                  prefix: "/"
+                  headers:
+                    - name: ":method"
+                      value: "POST"
+                route:
+                  cluster: service1
+                decorator:
+                  operation: updateAvailability
```

Shut down your example, if needed by running

`docker-compose down --remove-orphans`

in the `zipkin-tracing` directory, and then start your example again by running

`docker-compose up --build -d`

Run wrk with

`wrk -c 1 -t 1 --latency -d 5s http://localhost:8000/service/1`

and you should see results like

```console
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    56.99ms   10.16ms 126.43ms   96.67%
    Req/Sec    17.18      4.17    20.00     78.00%
  Latency Distribution
     50%   54.97ms
     75%   57.91ms
     90%   60.97ms
     99%  126.43ms
  89 requests in 5.09s, 22.17KB read
Requests/sec:     17.49
Transfer/sec:      4.36KB
```

As you can see, success rate for GET requests is still 100%. However if you run
curl in a loop like the following

`for i in `seq 1 100`; do curl -XPOST -v -q --stderr - localhost:8000/service/1 | grep '< HTTP'; done | sort | uniq -c`

You should see some failures.

```console
  97 < HTTP/1.1 200 OK
   3 < HTTP/1.1 503 Service Unavailable
```

This is good! Our retry policy doesn't affect POST requests, only GETs

To proceed to the next step run `git checkout step4`.
