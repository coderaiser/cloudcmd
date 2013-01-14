async = require 'async'
{spawn, exec} = require 'child_process'
fs = require 'fs'
glob = require 'glob'
log = console.log
path = require 'path'
remove = require 'remove'

# Node 0.6 compatibility hack.
unless fs.existsSync
  fs.existsSync = (filePath) -> path.existsSync filePath


task 'build', ->
  build()

task 'test', ->
  vendor ->
    build ->
      ssl_cert ->
        tokens ->
          run 'node_modules/mocha/bin/mocha --colors --slow 200 ' +
              '--timeout 10000 --require test/js/helper.js test/js/*test.js'

task 'webtest', ->
  vendor ->
    build ->
      ssl_cert ->
        tokens ->
          webtest()

task 'cert', ->
  remove.removeSync 'test/ssl', ignoreMissing: true
  ssl_cert()

task 'vendor', ->
  remove.removeSync './test/vendor', ignoreMissing: true
  vendor()

task 'tokens', ->
  remove.removeSync './test/.token', ignoreMissing: true
  build ->
    tokens ->
      process.exit 0

task 'doc', ->
  run 'node_modules/codo/bin/codo src'

task 'extension', ->
  run 'node_modules/coffee-script/bin/coffee ' +
      '--compile test/chrome_extension/*.coffee'

task 'chrome', ->
  vendor ->
    build ->
      # The v2 Chrome App API isn't supported yet.
      buildChromeApp 'app_v1'

task 'chrometest', ->
  vendor ->
    build ->
      # The v2 Chrome App API isn't supported yet.
      buildChromeApp 'app_v1', ->
        testChromeApp()

build = (callback) ->
  commands = []

  # Ignoring ".coffee" when sorting.
  # We want "driver.coffee" to sort before "driver-browser.coffee"
  source_files = glob.sync 'src/*.coffee'
  source_files.sort (a, b) ->
    a.replace(/\.coffee$/, '').localeCompare b.replace(/\.coffee$/, '')

  # Compile without --join for decent error messages.
  commands.push 'node_modules/coffee-script/bin/coffee --output tmp ' +
                "--compile #{source_files.join(' ')}"
  commands.push 'node_modules/coffee-script/bin/coffee --output lib ' +
                "--compile --join dropbox.js #{source_files.join(' ')}"
  # Minify the javascript, for browser distribution.
  commands.push 'node_modules/uglify-js/bin/uglifyjs --compress --mangle ' +
                '--output lib/dropbox.min.js lib/dropbox.js'
  commands.push 'node_modules/coffee-script/bin/coffee --output test/js ' +
                '--compile test/src/*.coffee'
  async.forEachSeries commands, run, ->
    callback() if callback

webtest = (callback) ->
  webFileServer = require './test/js/web_file_server.js'
  if 'BROWSER' of process.env
    if process.env['BROWSER'] is 'false'
      url = webFileServer.testUrl()
      console.log "Please open the URL below in your browser:\n    #{url}"
    else
      webFileServer.openBrowser process.env['BROWSER']
  else
    webFileServer.openBrowser()
  callback() if callback?

ssl_cert = (callback) ->
  fs.mkdirSync 'test/ssl' unless fs.existsSync 'test/ssl'
  if fs.existsSync 'test/ssl/cert.pem'
    callback() if callback?
    return

  run 'openssl req -new -x509 -days 365 -nodes -batch ' +
      '-out test/ssl/cert.pem -keyout test/ssl/cert.pem ' +
      '-subj /O=dropbox.js/OU=Testing/CN=localhost ', callback

vendor = (callback) ->
  # All the files will be dumped here.
  fs.mkdirSync 'test/vendor' unless fs.existsSync 'test/vendor'

  # Embed the binary test image into a 7-bit ASCII JavaScript.
  bytes = fs.readFileSync 'test/binary/dropbox.png'
  fragments = []
  for i in [0...bytes.length]
    fragment = bytes.readUInt8(i).toString 16
    while fragment.length < 4
      fragment = '0' + fragment
    fragments.push "\\u#{fragment}"
  js = "window.testImageBytes = \"#{fragments.join('')}\";"
  fs.writeFileSync 'test/vendor/favicon.js', js

  downloads = [
    # chai.js ships different builds for browsers vs node.js
    ['http://chaijs.com/chai.js', 'test/vendor/chai.js'],
    # sinon.js also ships special builds for browsers
    ['http://sinonjs.org/releases/sinon.js', 'test/vendor/sinon.js'],
    # ... and sinon.js ships an IE-only module
    ['http://sinonjs.org/releases/sinon-ie.js', 'test/vendor/sinon-ie.js']
  ]
  async.forEachSeries downloads, download, ->
    callback() if callback

testChromeApp = (callback) ->
  # Clean up the profile.
  fs.mkdirSync 'test/chrome_profile' unless fs.existsSync 'test/chrome_profile'

  command = "\"#{chromeCommand()}\" --load-extension=test/chrome_app " +
      '--user-data-dir=test/chrome_profile --no-default-browser-check ' +
      '--no-first-run --no-service-autorun --disable-default-apps ' +
      '--homepage=about:blank --v=-1'

  run command, ->
    callback() if callback

buildChromeApp = (manifestFile, callback) ->
  unless fs.existsSync 'test/chrome_app/test'
    fs.mkdirSync 'test/chrome_app/test'
  unless fs.existsSync 'test/chrome_app/node_modules'
    fs.mkdirSync 'test/chrome_app/node_modules'

  links = [
    ['lib', 'test/chrome_app/lib'],
    ['node_modules/mocha', 'test/chrome_app/node_modules/mocha'],
    ['node_modules/sinon-chai', 'test/chrome_app/node_modules/sinon-chai'],
    ['test/.token', 'test/chrome_app/test/.token'],
    ['test/binary', 'test/chrome_app/test/binary'],
    ['test/html', 'test/chrome_app/test/html'],
    ['test/js', 'test/chrome_app/test/js'],
    ['test/vendor', 'test/chrome_app/test/vendor'],
  ]
  commands = [
    "cp test/chrome_app/manifests/#{manifestFile}.json " +
        'test/chrome_app/manifest.json'
  ]
  for link in links
  #   fs.symlinkSync(path.resolve(link[0]), link[1]) unless fs.existsSync link[1]
    commands.push "cp -r #{link[0]} #{path.dirname(link[1])}"
  async.forEachSeries commands, run, ->
    callback() if callback

chromeCommand = ->
  paths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/MacOS/Contents/Chromium',
  ]
  for path in paths
    return path if fs.existsSync path

  if 'process.platform' is 'win32'
    'chrome'
  else
    'google-chrome'

tokens = (callback) ->
  TokenStash = require './test/js/token_stash.js'
  tokenStash = new TokenStash
  (new TokenStash()).get ->
    callback() if callback?

run = (args...) ->
  for a in args
    switch typeof a
      when 'string' then command = a
      when 'object'
        if a instanceof Array then params = a
        else options = a
      when 'function' then callback = a

  command += ' ' + params.join ' ' if params?
  cmd = spawn '/bin/sh', ['-c', command], options
  cmd.stdout.on 'data', (data) -> process.stdout.write data
  cmd.stderr.on 'data', (data) -> process.stderr.write data
  process.on 'SIGHUP', -> cmd.kill()
  cmd.on 'exit', (code) -> callback() if callback? and code is 0

download = ([url, file], callback) ->
  if fs.existsSync file
    callback() if callback?
    return

  run "curl -o #{file} #{url}", callback
