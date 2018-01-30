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

# Step 1

In this step we add a configurable latency and success rate to the python
service that underlies all the Envoy examples. Check out this tag and
start the zipkin tracing example by running

`docker-compose up --build -d`

in the `zipkin-tracing` directory.

Run wrk with 

`wrk -c 1 -t 1 --latency -d 5s http://localhost:8000/service/1`

and you should see results like

```console
Running 5s test @ http://localhost:8000/service/1
  1 threads and 1 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    55.01ms    2.41ms  61.58ms   72.83%
    Req/Sec    17.72      3.82    20.00     84.00%
  Latency Distribution
     50%   54.84ms
     75%   56.53ms
     90%   58.25ms
     99%   61.58ms
  92 requests in 5.10s, 24.12KB read
  Non-2xx or 3xx responses: 7
Requests/sec:     18.04
Transfer/sec:      4.73KB
```

As you can see, success rate is less than 100%, and the latency histogram has a
median of roughly 50 ms.

To proceed to the next step run `git checkout step2`.
