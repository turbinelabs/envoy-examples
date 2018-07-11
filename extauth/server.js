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
  let userClusterMap = {
    'mark': 'service1',
    'jane': 'service2',
  }
  let user = request.headers['x-user-id']
  if (user) {
    let userCluster = userClusterMap[user]
    if (userCluster) {
      let headers = {
        'Content-Length': '2',
        'x-user-cluster': userCluster
      }
      response.writeHead(200, headers)
      response.end("OK")
    } else {
      let body = `user ${user} not found`
      let headers = {
        'Content-Length': body.length
      }
      response.writeHead(401, headers)
      response.end(body)
    }
  } else {
    body = 'must specify a user'
    let headers = {
      'Content-Length': body.length
    }
    response.writeHead(400, headers)
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
