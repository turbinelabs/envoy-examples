from flask import Flask, abort
from flask import request
import socket
import os
import sys
import requests
import random
import time
import math

app = Flask(__name__)

TRACE_HEADERS_TO_PROPAGATE = [
    'X-Ot-Span-Context',
    'X-Request-Id',
    'X-B3-TraceId',
    'X-B3-SpanId',
    'X-B3-ParentSpanId',
    'X-B3-Sampled',
    'X-B3-Flags'
]

delay = float(os.environ['LATENCY']) if 'LATENCY' in os.environ else 0
success = int(os.environ['SUCCESS']) if 'SUCCESS' in os.environ else 100
sys.stderr.write(f"delay={delay}, success={success}\n")
def sleep_time():
    if delay > 0:
        t = random.lognormvariate(math.log(delay), delay/1000)/1000
        sys.stderr.write(f"delaying {t} seconds\n")
        time.sleep(t)

def should_fail():
    return random.randint(0, 100) > success

@app.route('/service/<service_number>', methods=['GET', 'POST'])
def hello(service_number):
    sleep_time()
    if should_fail():
        abort(503)
    else:
        return ('Hello from behind Envoy (service {})! hostname: {} resolved'
                'hostname: {}\n'.format(os.environ['SERVICE_NAME'],
                                        socket.gethostname(),
                                        socket.gethostbyname(socket.gethostname())))

@app.route('/trace/<service_number>')
def trace(service_number):
    sleep_time()
    if should_fail():
        abort(503)
    else:
        headers = {}
        # call service 2 from service 1
        if int(os.environ['SERVICE_NAME']) == 1 :
            for header in TRACE_HEADERS_TO_PROPAGATE:
                if header in request.headers:
                    headers[header] = request.headers[header]
            ret = requests.get("http://localhost:9000/trace/2", headers=headers)
            if ret.status_code != 200:
                abort(ret.status_code)
        return ('Hello from behind Envoy (service {})! hostname: {} resolved'
                'hostname: {}\n'.format(os.environ['SERVICE_NAME'],
                                        socket.gethostname(),
                                        socket.gethostbyname(socket.gethostname())))

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8080, debug=True)
