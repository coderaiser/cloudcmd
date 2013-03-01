express = require 'express'
fs = require 'fs'
https = require 'https'
open = require 'open'

# Tiny express.js server for the Web files.
class WebFileServer
  # Starts up a HTTP server.
  constructor: (@port = 8911) ->
    @createApp()

  # Opens the test URL in a browser.
  openBrowser: (appName) ->
    open @testUrl(), appName

  # The URL that should be used to start the tests.
  testUrl: ->
    "https://localhost:#{@port}/test/html/browser_test.html"

  # The server code.
  createApp: ->
    @app = express()
    @app.get '/diediedie', (request, response) =>
      if 'failed' of request.query
        failed = parseInt request.query['failed']
      else
        failed = 1
      total = parseInt request.query['total'] || 0
      passed = total - failed
      exitCode = if failed == 0 then 0 else 1
      console.log "#{passed} passed, #{failed} failed"

      response.header 'Content-Type', 'image/png'
      response.header 'Content-Length', '0'
      response.end ''
      unless 'NO_EXIT' of process.env
        @server.close()
        process.exit exitCode

    @app.use (request, response, next) ->
      response.header 'Access-Control-Allow-Origin', '*'
      response.header 'Access-Control-Allow-Methods', 'DELETE,GET,POST,PUT'
      response.header 'Access-Control-Allow-Headers',
                      'Content-Type, Authorization'
      next()

    @app.use express.static(fs.realpathSync(__dirname + '/../../'),
                            { hidden: true })
    options = key: fs.readFileSync 'test/ssl/cert.pem'
    options.cert = options.key
    @server = https.createServer(options, @app)
    @server.listen @port

module.exports = new WebFileServer
