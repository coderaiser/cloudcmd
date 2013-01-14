# Stashes Dropbox access credentials.
class TokenStash
  # @param {Object} options the advanced options below
  # @option options {Boolean} fullDropbox if true, the returned credentials
  #     will be good for full Dropbox access; otherwise, the credentials will
  #     work for Folder access
  constructor: (options) ->
    @fs = require 'fs'
    # Node 0.6 hack.
    unless @fs.existsSync
      path = require 'path'
      @fs.existsSync = (filePath) -> path.existsSync filePath
    @getCache = null
    @sandbox = !options?.fullDropbox
    @setupFs()

  # Calls the supplied method with the Dropbox access credentials.
  get: (callback) ->
    @getCache or= @readStash()
    if @getCache
      callback @getCache
      return null

    @liveLogin (fullCredentials, sandboxCredentials) =>
      unless fullCredentials and sandboxCredentials
        throw new Error('Dropbox API authorization failed')

      @writeStash fullCredentials, sandboxCredentials
      @getCache = @readStash()
      callback @getCache

  # Obtains credentials by doing a login on the live site.
  liveLogin: (callback) ->
    Dropbox = require '../../lib/dropbox'
    sandboxClient = new Dropbox.Client @clientOptions().sandbox
    fullClient = new Dropbox.Client @clientOptions().full
    @setupAuth()
    sandboxClient.authDriver @authDriver
    sandboxClient.authenticate (error, data) =>
      if error
        @killAuth()
        callback null
        return
      fullClient.authDriver @authDriver
      fullClient.authenticate (error, data) =>
        @killAuth()
        if error
          callback null
          return
        credentials = @clientOptions()
        callback fullClient.credentials(), sandboxClient.credentials()

  # Returns the options used to create a Dropbox Client.
  clientOptions: ->
    {
      sandbox:
        sandbox: true
        key: 'gWJAiHNbmDA=|MJ3xAk3nLeByuOckISnHib+h+1zTCG3TKTOEFvAAZw=='
      full:
        key: 'OYaTsqx6IXA=|z8mRqmTRoSdCqvkTvHTZq4ZZNxa7I5wM8X5E33IwCA=='
    }

  # Reads the file containing the access credentials, if it is available.
  #
  # @return {Object?} parsed access credentials, or null if they haven't been
  #     stashed
  readStash: ->
    unless @fs.existsSync @jsonPath
      return null
    stash = JSON.parse @fs.readFileSync @jsonPath
    if @sandbox then stash.sandbox else stash.full

  # Stashes the access credentials for future test use.
  writeStash: (fullCredentials, sandboxCredentials) ->
    json = JSON.stringify full: fullCredentials, sandbox: sandboxCredentials
    @fs.writeFileSync @jsonPath, json

    js = "window.testKeys = #{JSON.stringify sandboxCredentials};" +
         "window.testFullDropboxKeys = #{JSON.stringify fullCredentials};"
    @fs.writeFileSync @jsPath, js

  # Sets up a node.js server-based authentication driver.
  setupAuth: ->
    return if @authDriver

    Dropbox = require '../../lib/dropbox'
    @authDriver = new Dropbox.Drivers.NodeServer

  # Shuts down the node.js server behind the authentication server.
  killAuth: ->
    return unless @authDriver

    @authDriver.closeServer()
    @authDriver = null

  # Sets up the directory structure for the credential stash.
  setupFs: ->
    @dirPath = 'test/.token'
    @jsonPath = 'test/.token/token.json'
    @jsPath = 'test/.token/token.js'

    unless @fs.existsSync @dirPath
      @fs.mkdirSync @dirPath

module.exports = TokenStash
