if global? and require? and module?
  # Node.JS
  exports = global

  exports.Dropbox = require '../../lib/dropbox'
  exports.chai = require 'chai'
  exports.sinon = require 'sinon'
  exports.sinonChai = require 'sinon-chai'

  exports.authDriver = new Dropbox.Drivers.NodeServer port: 8912

  TokenStash = require './token_stash.js'
  (new TokenStash()).get (credentials) ->
    exports.testKeys = credentials
  (new TokenStash(fullDropbox: true)).get (credentials) ->
    exports.testFullDropboxKeys = credentials

  testIconPath = './test/binary/dropbox.png'
  fs = require 'fs'
  buffer = fs.readFileSync testIconPath
  bytes = []
  for i in [0...buffer.length]
    bytes.push String.fromCharCode(buffer.readUInt8(i))
  exports.testImageBytes = bytes.join ''
  exports.testImageUrl = 'http://localhost:8913/favicon.ico'
  imageServer = null
  exports.testImageServerOn = ->
    imageServer =
        new Dropbox.Drivers.NodeServer port: 8913, favicon: testIconPath
  exports.testImageServerOff = ->
    imageServer.closeServer()
    imageServer = null
else
  if chrome? and chrome.runtime
    # Chrome app
    exports = window
    exports.authDriver = new Dropbox.Drivers.Chrome(
        receiverPath: 'test/html/chrome_oauth_receiver.html',
        scope: 'helper-chrome')
    # Hack-implement "rememberUser: false" in the Chrome driver.
    exports.authDriver.storeCredentials = (credentials, callback) -> callback()
    exports.authDriver.loadCredentials = (callback) -> callback null
  else
    # Browser
    exports = window
    exports.authDriver = new Dropbox.Drivers.Popup(
        receiverFile: 'oauth_receiver.html', scope: 'helper-popup')

  exports.testImageUrl = '/test/binary/dropbox.png'
  exports.testImageServerOn = -> null
  exports.testImageServerOff = -> null

# Shared setup.
exports.assert = exports.chai.assert
exports.expect = exports.chai.expect
