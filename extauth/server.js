/** @prettier */
/*
 * Copyright 2018 Turbine Labs, Inc.
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

let http = require('http')

let handleRequest = (request, response) => {
  console.log(request.headers)
  if(request.headers['x-user-id'] == 'mark') {
    let headers = {
      'Content-Length': '2',
      'X-auth-user': 'user123',
      'path': request.url,
      'status': '200',
      'method': 'GET'
    }
    response.writeHead(200, headers)
    response.end("OK")
  } else {
    body = 'must specify a user'
    let user = request.headers['x-user-id']
    if(user) {
      body = `user ${user} not found`
    }
    let headers = {
      'Content-Length': body.length,
      'path': request.url,
      'status': '200',
      'method': 'GET'
    }
    response.writeHead(403, headers)
    response.end(body)
  }
}

exports.server = http.createServer(handleRequest)
exports.listen = port => {
  exports.server.listen(port)
}

exports.close = callback => {
  exports.server.close(callback)
}
