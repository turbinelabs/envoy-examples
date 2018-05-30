This example shows how to send Envoy stats to statsd. It extends the zipkin tracing exercise from the
[envoy docs](https://www.envoyproxy.io/docs/envoy/latest/install/sandboxes/zipkin_tracing),
combining it with the
[docker-compose TICK stack example](https://github.com/influxdata/TICK-docker/)
from InfluxDB.

Usage:

`docker-compose up --build -d`

Then visit http://localhost:8888/ to see a
working
[Chronograph](https://www.influxdata.com/time-series-platform/chronograf/)
installation with metrics from your Envoy instance.
