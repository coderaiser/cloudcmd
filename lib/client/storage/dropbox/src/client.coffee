# Represents a user accessing the application.
class Dropbox.Client
  # Dropbox client representing an application.
  #
  # For an optimal user experience, applications should use a single client for
  # all Dropbox interactions.
  #
  # @param {Object} options the application type and API key
  # @option options {Boolean} sandbox true for applications that request
  #   sandbox access (access to a single folder exclusive to the app)
  # @option options {String} key the Dropbox application's key; browser-side
  #   applications should use Dropbox.encodeKey to obtain an encoded
  #   key string, and pass it as the key option
  # @option options {String} secret the Dropbox application's secret;
  #   browser-side applications should not use the secret option; instead,
  #   they should pass the result of Dropbox.encodeKey as the key option
  # @option options {String} token if set, the user's access token
  # @option options {String} tokenSecret if set, the secret for the user's
  #   access token
  # @option options {String} uid if set, the user's Dropbox UID
  # @option options {Number} authState if set, indicates that the token and
  #   tokenSecret are in an intermediate state in the authentication process;
  #   this option should never be set by hand, however it may be returned by
  #   calls to credentials()
  constructor: (options) ->
    @sandbox = options.sandbox or false
    @apiServer = options.server or @defaultApiServer()
    @authServer = options.authServer or @defaultAuthServer()
    @fileServer = options.fileServer or @defaultFileServer()
    @downloadServer = options.downloadServer or @defaultDownloadServer()

    @oauth = new Dropbox.Oauth options
    @driver = null
    @filter = null
    @uid = null
    @authState = null
    @authError = null
    @_credentials = null
    @setCredentials options

    @setupUrls()

  # Plugs in the OAuth / application integration code.
  #
  # @param {DropboxAuthDriver} driver provides the integration between the
  #   application and the Dropbox OAuth flow; most applications should be
  #   able to use instances of Dropbox.Driver.Redirect, Dropbox.Driver.Popup,
  #   or Dropbox.Driver.NodeServer
  # @return {Dropbox.Client} this, for easy call chaining
  authDriver: (driver) ->
    @driver = driver
    @

  # Plugs in a filter for all XMLHttpRequests issued by this client.
  #
  # Whenever possible, filter implementations should only use the native
  # XMHttpRequest object received as the first argument. The Dropbox.Xhr API
  # implemented by the second argument is not yet stabilized.
  #
  # @param {function(XMLHttpRequest, Dropbox.Xhr): boolean} filter called every
  #     time the client is about to send a network request; the filter can
  #     inspect and modify the XMLHttpRequest; if the filter returns a falsey
  #     value, the XMLHttpRequest will not be sent
  # @return {Drobpox.Client} this, for easy call chaining
  xhrFilter: (filter) ->
    @filter = filter
    @

  # The authenticated user's Dropbx user ID.
  #
  # This user ID is guaranteed to be consistent across API calls from the same
  # application (not across applications, though).
  #
  # @return {?String} a short ID that identifies the user, or null if no user
  #   is authenticated
  dropboxUid: ->
    @uid

  # Get the client's OAuth credentials.
  #
  # @param {?Object} the result of a prior call to credentials()
  # @return {Object} a plain object whose properties can be passed to the
  #   Dropbox.Client constructor to reuse this client's login credentials
  credentials: () ->
    @computeCredentials() unless @_credentials
    @_credentials

  # Authenticates the app's user to Dropbox' API server.
  #
  # @param {function(?Dropbox.ApiError, ?Dropbox.Client)} callback called when
  #   the authentication completes; if successful, the second parameter is
  #   this client and the first parameter is null
  # @return {Dropbox.Client} this, for easy call chaining
  authenticate: (callback) ->
    oldAuthState = null

    # Advances the authentication FSM by one step.
    _fsmStep = =>
      if oldAuthState isnt @authState
        oldAuthState = @authState
        if @driver.onAuthStateChange
          return @driver.onAuthStateChange(@, _fsmStep)

      switch @authState
        when DropboxClient.RESET  # No user credentials -> request token.
          @requestToken (error, data) =>
            if error
              @authError = error
              @authState = DropboxClient.ERROR
            else
              token = data.oauth_token
              tokenSecret = data.oauth_token_secret
              @oauth.setToken token, tokenSecret
              @authState = DropboxClient.REQUEST
            @_credentials = null
            _fsmStep()

        when DropboxClient.REQUEST  # Have request token, get it authorized.
          authUrl = @authorizeUrl @oauth.token
          @driver.doAuthorize authUrl, @oauth.token, @oauth.tokenSecret, =>
            @authState = DropboxClient.AUTHORIZED
            @_credentials = null
            _fsmStep()

        when DropboxClient.AUTHORIZED
          # Request token authorized, switch it for an access token.
          @getAccessToken (error, data) =>
            if error
              @authError = error
              @authState = DropboxClient.ERROR
            else
              @oauth.setToken data.oauth_token, data.oauth_token_secret
              @uid = data.uid
              @authState = DropboxClient.DONE
            @_credentials = null
            _fsmStep()

        when DropboxClient.DONE  # We have an access token.
          callback null, @

        when Dropbox.SIGNED_OFF  # The user signed off, restart the flow.
          @reset()
          _fsmStep()

        when DropboxClient.ERROR  # An error occurred during authentication.
          callback @authError

    _fsmStep()  # Start up the state machine.
    @

  # Revokes the user's Dropbox credentials.
  #
  # This should be called when the user explictly signs off from your
  # application, to meet the users' expectation that after they sign off, their
  # access tokens will be persisted on the machine.
  #
  # @param {function(?Dropbox.ApiError)} callback called when
  #   the authentication completes; if successful, the error parameter is
  #   null
  # @return {XMLHttpRequest} the XHR object used for this API call
  signOut: (callback) ->
    xhr = new Dropbox.Xhr 'POST', @urls.signOut
    xhr.signWithOauth @oauth
    @dispatchXhr xhr, (error) =>
      return callback(error) if error

      @reset()
      @authState = DropboxClient.SIGNED_OFF
      if @driver.onAuthStateChange
        @driver.onAuthStateChange @, ->
          callback error
      else
        callback error

  # Alias for signOut.
  signOff: (callback) ->
    @signOut callback

  # Retrieves information about the logged in user.
  #
  # @param {function(?Dropbox.ApiError, ?Dropbox.UserInfo, ?Object)} callback
  #   called with the result of the /account/info HTTP request; if the call
  #   succeeds, the second parameter is a Dropbox.UserInfo instance, the
  #   third parameter is the parsed JSON data behind the Dropbox.UserInfo
  #   instance, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  getUserInfo: (callback) ->
    xhr = new Dropbox.Xhr 'GET', @urls.accountInfo
    xhr.signWithOauth @oauth
    @dispatchXhr xhr, (error, userData) ->
      callback error, Dropbox.UserInfo.parse(userData), userData

  # Retrieves the contents of a file stored in Dropbox.
  #
  # Some options are silently ignored in Internet Explorer 9 and below, due to
  # insufficient support in its proprietary XDomainRequest replacement for XHR.
  # Currently, the options are: arrayBuffer, blob, length, start.
  #
  # @param {String} path the path of the file to be read, relative to the
  #   user's Dropbox or to the application's folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {String} versionTag the tag string for the desired version
  #   of the file contents; the most recent version is retrieved by default
  # @option options {String} rev alias for "versionTag" that matches the HTTP
  #   API
  # @option options {Boolean} arrayBuffer if true, the file's contents  will be
  #   passed to the callback in an ArrayBuffer; this is a good method of
  #   reading non-UTF8 data, such as images; requires XHR Level 2 support,
  #   which is not available in IE <= 9
  # @option options {Boolean} blob if true, the file's contents  will be
  #   passed to the callback in a Blob; this is a good method of reading
  #   non-UTF8 data, such as images; requires XHR Level 2 support, which is not
  #   available in IE <= 9
  # @option options {Boolean} binary if true, the file will be retrieved as a
  #   binary string; the default is an UTF-8 encoded string; this relies on
  #   browser hacks and should not be used if the environment supports the Blob
  #   API
  # @option options {Number} length the number of bytes to be retrieved from
  #   the file; if the start option is not present, the last "length" bytes
  #   will be read (after issue #30 is closed); by default, the entire file is
  #   read
  # @option options {Number} start the 0-based offset of the first byte to be
  #   retrieved; if the length option is not present, the bytes between
  #   "start" and the file's end will be read; by default, the entire
  #   file is read
  # @param {function(?Dropbox.ApiError, ?String, ?Dropbox.Stat)} callback
  #   called with the result of the /files (GET) HTTP request; the second
  #   parameter is the contents of the file, the third parameter is a
  #   Dropbox.Stat instance describing the file, and the first parameter is
  #   null
  # @return {XMLHttpRequest} the XHR object used for this API call
  readFile: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    params = {}
    responseType = null
    rangeHeader = null
    if options
      if options.versionTag
        params.rev = options.versionTag
      else if options.rev
        params.rev = options.rev

      if options.arrayBuffer
        responseType = 'arraybuffer'
      else if options.blob
        responseType = 'blob'
      else if options.binary
        responseType = 'b'  # See the Dropbox.Xhr.request2 docs

      if options.length
        if options.start?
          rangeStart = options.start
          rangeEnd = options.start + options.length - 1
        else
          rangeStart = ''
          rangeEnd = options.length
        rangeHeader = "bytes=#{rangeStart}-#{rangeEnd}"
      else if options.start?
        rangeHeader = "bytes=#{options.start}-"

    xhr = new Dropbox.Xhr 'GET', "#{@urls.getFile}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth(@oauth).setResponseType(responseType)
    xhr.setHeader 'Range', rangeHeader if rangeHeader
    @dispatchXhr xhr, (error, data, metadata) ->
      callback error, data, Dropbox.Stat.parse(metadata)

  # Store a file into a user's Dropbox.
  #
  # @param {String} path the path of the file to be created, relative to the
  #   user's Dropbox or to the application's folder
  # @param {String, ArrayBuffer, ArrayBufferView, Blob, File} data the contents
  #   written to the file; if a File is passed, its name is ignored
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {String} lastVersionTag the identifier string for the
  #   version of the file's contents that was last read by this program, used
  #   for conflict resolution; for best results, use the versionTag attribute
  #   value from the Dropbox.Stat instance provided by readFile
  # @option options {String} parentRev alias for "lastVersionTag" that matches
  #   the HTTP API
  # @option options {Boolean} noOverwrite if set, the write will not overwrite
  #   a file with the same name that already exsits; instead the contents
  #   will be written to a similarly named file (e.g. "notes (1).txt"
  #   instead of "notes.txt")
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /files (POST) HTTP request; the second paramter is a
  #   Dropbox.Stat instance describing the newly created file, and the first
  #   parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  writeFile: (path, data, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    useForm = Dropbox.Xhr.canSendForms and typeof data is 'object'
    if useForm
      @writeFileUsingForm path, data, options, callback
    else
      @writeFileUsingPut path, data, options, callback

  # writeFile implementation that uses the POST /files API.
  #
  # @private
  # This method is more demanding in terms of CPU and browser support, but does
  # not require CORS preflight, so it always completes in 1 HTTP request.
  writeFileUsingForm: (path, data, options, callback) ->
    # Break down the path into a file/folder name and the containing folder.
    slashIndex = path.lastIndexOf '/'
    if slashIndex is -1
      fileName = path
      path = ''
    else
      fileName = path.substring slashIndex
      path = path.substring 0, slashIndex

    params = { file: fileName }
    if options
      if options.noOverwrite
        params.overwrite = 'false'
      if options.lastVersionTag
        params.parent_rev = options.lastVersionTag
      else if options.parentRev or options.parent_rev
        params.parent_rev = options.parentRev or options.parent_rev
    # TODO: locale support would edit the params here

    xhr = new Dropbox.Xhr 'POST', "#{@urls.postFile}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth(@oauth).setFileField('file', fileName,
        data, 'application/octet-stream')

    # NOTE: the Dropbox API docs ask us to replace the 'file' parameter after
    #       signing the request; the hack below works as intended
    delete params.file

    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # writeFile implementation that uses the /files_put API.
  #
  # @private
  # This method is less demanding on CPU, and makes fewer assumptions about
  # browser support, but it takes 2 HTTP requests for binary files, because it
  # needs CORS preflight.
  writeFileUsingPut: (path, data, options, callback) ->
    params = {}
    if options
      if options.noOverwrite
        params.overwrite = 'false'
      if options.lastVersionTag
        params.parent_rev = options.lastVersionTag
      else if options.parentRev or options.parent_rev
        params.parent_rev = options.parentRev or options.parent_rev
    # TODO: locale support would edit the params here
    xhr = new Dropbox.Xhr 'POST', "#{@urls.putFile}/#{@urlEncodePath(path)}"
    xhr.setBody(data).setParams(params).signWithOauth(@oauth)
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # Reads the metadata of a file or folder in a user's Dropbox.
  #
  # @param {String} path the path to the file or folder whose metadata will be
  #   read, relative to the user's Dropbox or to the application's folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Number} version if set, the call will return the metadata
  #   for the given revision of the file / folder; the latest version is used
  #   by default
  # @option options {Boolean} removed if set to true, the results will include
  #   files and folders that were deleted from the user's Dropbox
  # @option options {Boolean} deleted alias for "removed" that matches the HTTP
  #   API; using this alias is not recommended, because it may cause confusion
  #   with JavaScript's delete operation
  # @option options {Boolean, Number} readDir only meaningful when stat-ing
  #   folders; if this is set, the API call will also retrieve the folder's
  #   contents, which is passed into the callback's third parameter; if this
  #   is a number, it specifies the maximum number of files and folders that
  #   should be returned; the default limit is 10,000 items; if the limit is
  #   exceeded, the call will fail with an error
  # @option options {String} versionTag used for saving bandwidth when getting
  #   a folder's contents; if this value is specified and it matches the
  #   folder's contents, the call will fail with a 304 (Contents not changed)
  #   error code; a folder's version identifier can be obtained from the
  #   versionTag attribute of a Dropbox.Stat instance describing it
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat, ?Array<Dropbox.Stat>)}
  #   callback called with the result of the /metadata HTTP request; if the
  #   call succeeds, the second parameter is a Dropbox.Stat instance
  #   describing the file / folder, and the first parameter is null;
  #   if the readDir option is true and the call succeeds, the third
  #   parameter is an array of Dropbox.Stat instances describing the folder's
  #   entries
  # @return {XMLHttpRequest} the XHR object used for this API call
  stat: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    params = {}
    if options
      if options.version?
        params.rev = options.version
      if options.removed or options.deleted
        params.include_deleted = 'true'
      if options.readDir
        params.list = 'true'
        if options.readDir isnt true
          params.file_limit = options.readDir.toString()
      if options.cacheHash
        params.hash = options.cacheHash
    params.include_deleted ||= 'false'
    params.list ||= 'false'
    # TODO: locale support would edit the params here
    xhr = new Dropbox.Xhr 'GET', "#{@urls.metadata}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth @oauth
    @dispatchXhr xhr, (error, metadata) ->
      stat = Dropbox.Stat.parse metadata
      if metadata?.contents
        entries = (Dropbox.Stat.parse(entry) for entry in metadata.contents)
      else
        entries = undefined
      callback error, stat, entries

  # Lists the files and folders inside a folder in a user's Dropbox.
  #
  # @param {String} path the path to the folder whose contents will be
  #   retrieved, relative to the user's Dropbox or to the application's
  #   folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Boolean} removed if set to true, the results will include
  #   files and folders that were deleted from the user's Dropbox
  # @option options {Boolean} deleted alias for "removed" that matches the HTTP
  #   API; using this alias is not recommended, because it may cause confusion
  #   with JavaScript's delete operation
  # @option options {Boolean, Number} limit the maximum number of files and
  #   folders that should be returned; the default limit is 10,000 items; if
  #   the limit is exceeded, the call will fail with an error
  # @option options {String} versionTag used for saving bandwidth; if this
  #   option is specified, and its value matches the folder's version tag,
  #   the call will fail with a 304 (Contents not changed) error code
  #   instead of returning the contents; a folder's version identifier can be
  #   obtained from the versionTag attribute of a Dropbox.Stat instance
  #   describing it
  # @param {function(?Dropbox.ApiError, ?Array<String>, ?Dropbox.Stat,
  #   ?Array<Dropbox.Stat>)} callback called with the result of the /metadata
  #   HTTP request; if the call succeeds, the second parameter is an array
  #   containing the names of the files and folders in the given folder, the
  #   third parameter is a Dropbox.Stat instance describing the folder, the
  #   fourth parameter is an array of Dropbox.Stat instances describing the
  #   folder's entries, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  readdir: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    statOptions = { readDir: true }
    if options
      if options.limit?
        statOptions.readDir = options.limit
      if options.versionTag
        statOptions.versionTag = options.versionTag
    @stat path, statOptions, (error, stat, entry_stats) ->
      if entry_stats
        entries = (entry_stat.name for entry_stat in entry_stats)
      else
        entries = null
      callback error, entries, stat, entry_stats

  # Alias for "stat" that matches the HTTP API.
  metadata: (path, options, callback) ->
    @stat path, options, callback

  # Creates a publicly readable URL to a file or folder in the user's Dropbox.
  #
  # @param {String} path the path to the file or folder that will be linked to;
  #   the path is relative to the user's Dropbox or to the application's
  #   folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Boolean} download if set, the URL will be a direct
  #   download URL, instead of the usual Dropbox preview URLs; direct
  #   download URLs are short-lived (currently 4 hours), whereas regular URLs
  #   virtually have no expiration date (currently set to 2030); no direct
  #   download URLs can be generated for directories
  # @option options {Boolean} downloadHack if set, a long-living download URL
  #   will be generated by asking for a preview URL and using the officially
  #   documented hack at https://www.dropbox.com/help/201 to turn the preview
  #   URL into a download URL
  # @option options {Boolean} long if set, the URL will not be shortened using
  #   Dropbox's shortner; the download and downloadHack options imply long
  # @option options {Boolean} longUrl synonym for long; makes life easy for
  #     RhinoJS users
  # @param {function(?Dropbox.ApiError, ?Dropbox.PublicUrl)} callback called
  #   with the result of the /shares or /media HTTP request; if the call
  #   succeeds, the second parameter is a Dropbox.PublicUrl instance, and the
  #   first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  makeUrl: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    # NOTE: cannot use options.long; normally, the CoffeeScript compiler
    #       escapes keywords for us; although long isn't really a keyword, the
    #       Rhino VM thinks it is; this hack can be removed when the bug below
    #       is fixed:
    #       https://github.com/mozilla/rhino/issues/93
    if options and (options['long'] or options.longUrl or options.downloadHack)
      params = { short_url: 'false' }
    else
      params = {}

    path = @urlEncodePath path
    url = "#{@urls.shares}/#{path}"
    isDirect = false
    useDownloadHack = false
    if options
      if options.downloadHack
        isDirect = true
        useDownloadHack = true
      else if options.download
        isDirect = true
        url = "#{@urls.media}/#{path}"

    # TODO: locale support would edit the params here
    xhr = new Dropbox.Xhr('POST', url).setParams(params).signWithOauth(@oauth)
    @dispatchXhr xhr, (error, urlData) ->
      if useDownloadHack and urlData and urlData.url
        urlData.url = urlData.url.replace(@authServer, @downloadServer)
      callback error, Dropbox.PublicUrl.parse(urlData, isDirect)

  # Retrieves the revision history of a file in a user's Dropbox.
  #
  # @param {String} path the path to the file whose revision history will be
  #   retrieved, relative to the user's Dropbox or to the application's
  #   folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Number} limit if specified, the call will return at most
  #   this many versions
  # @param {function(?Dropbox.ApiError, ?Array<Dropbox.Stat>)} callback called
  #   with the result of the /revisions HTTP request; if the call succeeds,
  #   the second parameter is an array with one Dropbox.Stat instance per
  #   file version, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  history: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    params = {}
    if options and options.limit?
      params.rev_limit = options.limit

    xhr = new Dropbox.Xhr 'GET', "#{@urls.revisions}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth(@oauth)
    @dispatchXhr xhr, (error, versions) ->
      if versions
        stats = (Dropbox.Stat.parse(metadata) for metadata in versions)
      else
        stats = undefined
      callback error, stats

  # Alias for "history" that matches the HTTP API.
  revisions: (path, options, callback) ->
    @history path, options, callback

  # Computes a URL that generates a thumbnail for a file in the user's Dropbox.
  #
  # @param {String} path the path to the file whose thumbnail image URL will be
  #   computed, relative to the user's Dropbox or to the application's
  #   folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Boolean} png if true, the thumbnail's image will be a PNG
  #   file; the default thumbnail format is JPEG
  # @option options {String} format value that gets passed directly to the API;
  #   this is intended for newly added formats that the API may not support;
  #   use options such as "png" when applicable
  # @option options {String} sizeCode specifies the image's dimensions; this
  #   gets passed directly to the API; currently, the following values are
  #   supported: 'small' (32x32), 'medium' (64x64), 'large' (128x128),
  #   's' (64x64), 'm' (128x128), 'l' (640x480), 'xl' (1024x768); the default
  #   value is "small"
  # @return {String} a URL to an image that can be used as the thumbnail for
  #   the given file
  thumbnailUrl: (path, options) ->
    xhr = @thumbnailXhr path, options
    xhr.paramsToUrl().url

  # Retrieves the image data of a thumbnail for a file in the user's Dropbox.
  #
  # This method is intended to be used with low-level painting APIs. Whenever
  # possible, it is easier to place the result of thumbnailUrl in a DOM
  # element, and rely on the browser to fetch the file.
  #
  # @param {String} path the path to the file whose thumbnail image URL will be
  #   computed, relative to the user's Dropbox or to the application's
  #   folder
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Boolean} png if true, the thumbnail's image will be a PNG
  #   file; the default thumbnail format is JPEG
  # @option options {String} format value that gets passed directly to the API;
  #   this is intended for newly added formats that the API may not support;
  #   use options such as "png" when applicable
  # @option options {String} sizeCode specifies the image's dimensions; this
  #   gets passed directly to the API; currently, the following values are
  #   supported: 'small' (32x32), 'medium' (64x64), 'large' (128x128),
  #   's' (64x64), 'm' (128x128), 'l' (640x480), 'xl' (1024x768); the default
  #   value is "small"
  # @option options {Boolean} blob if true, the file will be retrieved as a
  #   Blob, instead of a String; this requires XHR Level 2 support, which is
  #   not available in IE <= 9
  # @param {function(?Dropbox.ApiError, ?Object, ?Dropbox.Stat)} callback
  #   called with the result of the /thumbnails HTTP request; if the call
  #   succeeds, the second parameter is the image data as a String or Blob,
  #   the third parameter is a Dropbox.Stat instance describing the
  #   thumbnailed file, and the first argument is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  readThumbnail: (path, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    responseType = 'b'
    if options
      responseType = 'blob' if options.blob

    xhr = @thumbnailXhr path, options
    xhr.setResponseType responseType
    @dispatchXhr xhr, (error, data, metadata) ->
      callback error, data, Dropbox.Stat.parse(metadata)

  # Sets up an XHR for reading a thumbnail for a file in the user's Dropbox.
  #
  # @see Dropbox.Client#thumbnailUrl
  # @return {Dropbox.Xhr} an XHR request configured for fetching the thumbnail
  thumbnailXhr: (path, options) ->
    params = {}
    if options
      if options.format
        params.format = options.format
      else if options.png
        params.format = 'png'
      if options.size
        # Can we do something nicer here?
        params.size = options.size

    xhr = new Dropbox.Xhr 'GET', "#{@urls.thumbnails}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth(@oauth)

  # Reverts a file's contents to a previous version.
  #
  # This is an atomic, bandwidth-optimized equivalent of reading the file
  # contents at the given file version (readFile), and then using it to
  # overwrite the file (writeFile).
  #
  # @param {String} path the path to the file whose contents will be reverted
  #   to a previous version, relative to the user's Dropbox or to the
  #   application's folder
  # @param {String} versionTag the tag of the version that the file will be
  #   reverted to; maps to the "rev" parameter in the HTTP API
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /restore HTTP request; if the call succeeds, the
  #   second parameter is a Dropbox.Stat instance describing the file after
  #   the revert operation, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  revertFile: (path, versionTag, callback) ->
    xhr = new Dropbox.Xhr 'POST', "#{@urls.restore}/#{@urlEncodePath(path)}"
    xhr.setParams(rev: versionTag).signWithOauth @oauth
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # Alias for "revertFile" that matches the HTTP API.
  restore: (path, versionTag, callback) ->
    @revertFile path, versionTag, callback

  # Finds files / folders whose name match a pattern, in the user's Dropbox.
  #
  # @param {String} path the path to the file whose contents will be reverted
  #   to a previous version, relative to the user's Dropbox or to the
  #   application's folder
  # @param {String} namePattern the string that file / folder names must
  #   contain in order to match the search criteria;
  # @param {?Object} options the advanced settings below; for the default
  #   settings, skip the argument or pass null
  # @option options {Number} limit if specified, the call will return at most
  #   this many versions
  # @option options {Boolean} removed if set to true, the results will include
  #   files and folders that were deleted from the user's Dropbox; the default
  #   limit is the maximum value of 1,000
  # @option options {Boolean} deleted alias for "removed" that matches the HTTP
  #   API; using this alias is not recommended, because it may cause confusion
  #   with JavaScript's delete operation
  # @param {function(?Dropbox.ApiError, ?Array<Dropbox.Stat>)} callback called
  #   with the result of the /search HTTP request; if the call succeeds, the
  #   second parameter is an array with one Dropbox.Stat instance per search
  #   result, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  findByName: (path, namePattern, options, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    params = { query: namePattern }
    if options
      if options.limit?
        params.file_limit = options.limit
      if options.removed or options.deleted
        params.include_deleted = true

    xhr = new Dropbox.Xhr 'GET', "#{@urls.search}/#{@urlEncodePath(path)}"
    xhr.setParams(params).signWithOauth(@oauth)
    @dispatchXhr xhr, (error, results) ->
      if results
        stats = (Dropbox.Stat.parse(metadata) for metadata in results)
      else
        stats = undefined
      callback error, stats

  # Alias for "findByName" that matches the HTTP API.
  search: (path, namePattern, options, callback) ->
    @findByName path, namePattern, options, callback

  # Creates a reference used to copy a file to another user's Dropbox.
  #
  # @param {String} path the path to the file whose contents will be
  #   referenced, relative to the uesr's Dropbox or to the application's
  #   folder
  # @param {function(?Dropbox.ApiError, ?Dropbox.CopyReference)} callback
  #   called with the result of the /copy_ref HTTP request; if the call
  #   succeeds, the second parameter is a Dropbox.CopyReference instance, and
  #   the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  makeCopyReference: (path, callback) ->
    xhr = new Dropbox.Xhr 'GET', "#{@urls.copyRef}/#{@urlEncodePath(path)}"
    xhr.signWithOauth @oauth
    @dispatchXhr xhr, (error, refData) ->
      callback error, Dropbox.CopyReference.parse(refData)

  # Alias for "makeCopyReference" that matches the HTTP API.
  copyRef: (path, callback) ->
    @makeCopyReference path, callback

  # Fetches a list of changes in the user's Dropbox since the last call.
  #
  # This method is intended to make full sync implementations easier and more
  # performant. Each call returns a cursor that can be used in a future call
  # to obtain all the changes that happened in the user's Dropbox (or
  # application directory) between the two calls.
  #
  # @param {Dropbox.PulledChanges, String} cursorTag the result of a previous
  #   call to pullChanges, or a string containing a tag representing the
  #   Dropbox state that is used as the baseline for the change list; this
  #   should be obtained from a previous call to pullChanges, or be set to null
  #   / ommitted on the first call to pullChanges
  # @param {function(?Dropbox.ApiError, ?Dropbox.PulledChanges)} callback
  #   called with the result of the /delta HTTP request; if the call
  #   succeeds, the second parameter is a Dropbox.PulledChanges describing
  #   the changes to the user's Dropbox since the pullChanges call that
  #   produced the given cursor, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  pullChanges: (cursor, callback) ->
    if (not callback) and (typeof cursor is 'function')
      callback = cursor
      cursor = null

    if cursor
      if cursor.cursorTag
        params = { cursor: cursor.cursorTag }
      else
        params = { cursor: cursor }
    else
      params = {}

    xhr = new Dropbox.Xhr 'POST', @urls.delta
    xhr.setParams(params).signWithOauth @oauth
    @dispatchXhr xhr, (error, deltaInfo) ->
      callback error, Dropbox.PulledChanges.parse(deltaInfo)

  # Alias for "pullChanges" that matches the HTTP API.
  delta: (cursor, callback) ->
    @pullChanges cursor, callback

  # Creates a folder in a user's Dropbox.
  #
  # @param {String} path the path of the folder that will be created, relative
  #   to the user's Dropbox or to the application's folder
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /fileops/create_folder HTTP request; if the call
  #   succeeds, the second parameter is a Dropbox.Stat instance describing
  #   the newly created folder, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  mkdir: (path, callback) ->
    xhr = new Dropbox.Xhr 'POST', @urls.fileopsCreateFolder
    xhr.setParams(root: @fileRoot, path: @normalizePath(path)).
        signWithOauth(@oauth)
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # Removes a file or diretory from a user's Dropbox.
  #
  # @param {String} path the path of the file to be read, relative to the
  #   user's Dropbox or to the application's folder
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /fileops/delete HTTP request; if the call succeeds,
  #   the second parameter is a Dropbox.Stat instance describing the removed
  #   file or folder, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  remove: (path, callback) ->
    xhr = new Dropbox.Xhr 'POST', @urls.fileopsDelete
    xhr.setParams(root: @fileRoot, path: @normalizePath(path)).
        signWithOauth(@oauth)
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # node.js-friendly alias for "remove".
  unlink: (path, callback) ->
    @remove path, callback

  # Alias for "remove" that matches the HTTP API.
  delete: (path, callback) ->
    @remove path, callback

  # Copies a file or folder in the user's Dropbox.
  #
  # This method's "from" parameter can be either a path or a copy reference
  # obtained by a previous call to makeCopyRef. The method uses a crude
  # heuristic to interpret the "from" string -- if it doesn't contain any
  # slash (/) or dot (.) character, it is assumed to be a copy reference. The
  # easiest way to work with it is to prepend "/" to every path passed to the
  # method. The method will process paths that start with multiple /s
  # correctly.
  #
  # @param {String, Dropbox.CopyReference} from the path of the file or folder
  #   that will be copied, or a Dropbox.CopyReference instance obtained by
  #   calling makeCopyRef or Dropbox.CopyReference.parse; if this is a path, it
  #   is relative to the user's Dropbox or to the application's folder
  # @param {String} toPath the path that the file or folder will have after the
  #   method call; the path is relative to the user's Dropbox or to the
  #   application folder
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /fileops/copy HTTP request; if the call succeeds, the
  #   second parameter is a Dropbox.Stat instance describing the file or folder
  #   created by the copy operation, and the first parameter is null
  # @return {XMLHttpRequest} the XHR object used for this API call
  copy: (from, toPath, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    params = { root: @fileRoot, to_path: @normalizePath(toPath) }
    if from instanceof Dropbox.CopyReference
      params.from_copy_ref = from.tag
    else
      params.from_path = @normalizePath from
    # TODO: locale support would edit the params here

    xhr = new Dropbox.Xhr 'POST', @urls.fileopsCopy
    xhr.setParams(params).signWithOauth @oauth
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # Moves a file or folder to a different location in a user's Dropbox.
  #
  # @param {String} fromPath the path of the file or folder that will be moved,
  #   relative to the user's Dropbox or to the application's folder
  # @param {String} toPath the path that the file or folder will have after
  #   the method call; the path is relative to the user's Dropbox or to the
  #   application's folder
  # @param {function(?Dropbox.ApiError, ?Dropbox.Stat)} callback called with
  #   the result of the /fileops/move HTTP request; if the call succeeds, the
  #   second parameter is a Dropbox.Stat instance describing the moved
  #   file or folder at its new location, and the first parameter is
  #   null
  # @return {XMLHttpRequest} the XHR object used for this API call
  move: (fromPath, toPath, callback) ->
    if (not callback) and (typeof options is 'function')
      callback = options
      options = null

    xhr = new Dropbox.Xhr 'POST', @urls.fileopsMove
    xhr.setParams(
        root: @fileRoot, from_path: @normalizePath(fromPath),
        to_path: @normalizePath(toPath)).signWithOauth @oauth
    @dispatchXhr xhr, (error, metadata) ->
      callback error, Dropbox.Stat.parse(metadata)

  # Removes all login information.
  #
  # @return {Dropbox.Client} this, for easy call chaining
  reset: ->
    @uid = null
    @oauth.setToken null, ''
    @authState = DropboxClient.RESET
    @authError = null
    @_credentials = null
    @

  # Change the client's OAuth credentials.
  #
  # @param {?Object} the result of a prior call to credentials()
  # @return {Dropbox.Client} this, for easy call chaining
  setCredentials: (credentials) ->
    @oauth.reset credentials
    @uid = credentials.uid or null
    if credentials.authState
      @authState = credentials.authState
    else
      if credentials.token
        @authState = DropboxClient.DONE
      else
        @authState = DropboxClient.RESET
    @authError = null
    @_credentials = null
    @

  # @return {String} a string that uniquely identifies the Dropbox application
  #   of this client
  appHash: ->
    @oauth.appHash()

  # Computes the URLs of all the Dropbox API calls.
  #
  # @private
  # This is called by the constructor, and used by the other methods. It should
  # not be used directly.
  setupUrls: ->
    @fileRoot = if @sandbox then 'sandbox' else 'dropbox'

    @urls =
      # Authentication.
      requestToken: "#{@apiServer}/1/oauth/request_token"
      authorize: "#{@authServer}/1/oauth/authorize"
      accessToken: "#{@apiServer}/1/oauth/access_token"
      signOut: "#{@apiServer}/1/unlink_access_token"

      # Accounts.
      accountInfo: "#{@apiServer}/1/account/info"

      # Files and metadata.
      getFile: "#{@fileServer}/1/files/#{@fileRoot}"
      postFile: "#{@fileServer}/1/files/#{@fileRoot}"
      putFile: "#{@fileServer}/1/files_put/#{@fileRoot}"
      metadata: "#{@apiServer}/1/metadata/#{@fileRoot}"
      delta: "#{@apiServer}/1/delta"
      revisions: "#{@apiServer}/1/revisions/#{@fileRoot}"
      restore: "#{@apiServer}/1/restore/#{@fileRoot}"
      search: "#{@apiServer}/1/search/#{@fileRoot}"
      shares: "#{@apiServer}/1/shares/#{@fileRoot}"
      media: "#{@apiServer}/1/media/#{@fileRoot}"
      copyRef: "#{@apiServer}/1/copy_ref/#{@fileRoot}"
      thumbnails: "#{@fileServer}/1/thumbnails/#{@fileRoot}"

      # File operations.
      fileopsCopy: "#{@apiServer}/1/fileops/copy"
      fileopsCreateFolder: "#{@apiServer}/1/fileops/create_folder"
      fileopsDelete: "#{@apiServer}/1/fileops/delete"
      fileopsMove: "#{@apiServer}/1/fileops/move"

  # authState value for a client that experienced an authentication error.
  @ERROR: 0

  # authState value for a properly initialized client with no user credentials.
  @RESET: 1

  # authState value for a client with a request token that must be authorized.
  @REQUEST: 2

  # authState value for a client whose request token was authorized.
  @AUTHORIZED: 3

  # authState value for a client that has an access token.
  @DONE: 4

  # authState value for a client that voluntarily invalidated its access token.
  @SIGNED_OFF: 5

  # Normalizes a Dropobx path and encodes it for inclusion in a request URL.
  #
  # @private
  # This is called internally by the other client functions, and should not be
  # used outside the {Dropbox.Client} class.
  urlEncodePath: (path) ->
    Dropbox.Xhr.urlEncodeValue(@normalizePath(path)).replace /%2F/gi, '/'

  # Normalizes a Dropbox path for API requests.
  #
  # @private
  # This is an internal method. It is used by all the client methods that take
  # paths as arguments.
  #
  # @param {String} path a path
  normalizePath: (path) ->
    if path.substring(0, 1) is '/'
      i = 1
      while path.substring(i, i + 1) is '/'
        i += 1
      path.substring i
    else
      path

  # Generates an OAuth request token.
  #
  # @private
  # This a low-level method called by authorize. Users should call authorize.
  #
  # @param {function(error, data)} callback called with the result of the
  #   /oauth/request_token HTTP request
  requestToken: (callback) ->
    xhr = new Dropbox.Xhr('POST', @urls.requestToken).signWithOauth(@oauth)
    @dispatchXhr xhr, callback

  # The URL for /oauth/authorize, embedding the user's token.
  #
  # @private
  # This a low-level method called by authorize. Users should call authorize.
  #
  # @param {String} token the oauth_token obtained from an /oauth/request_token
  #   call
  # @return {String} the URL that the user's browser should be redirected to in
  #   order to perform an /oauth/authorize request
  authorizeUrl: (token) ->
    params = { oauth_token: token, oauth_callback: @driver.url() }
    "#{@urls.authorize}?" + Dropbox.Xhr.urlEncode(params)

  # Exchanges an OAuth request token with an access token.
  #
  # @private
  # This a low-level method called by authorize. Users should call authorize.
  #
  # @param {function(error, data)} callback called with the result of the
  #   /oauth/access_token HTTP request
  getAccessToken: (callback) ->
    xhr = new Dropbox.Xhr('POST', @urls.accessToken).signWithOauth(@oauth)
    @dispatchXhr xhr, callback

  # Prepares an XHR before it is sent to the server.
  #
  # @private
  # This is a low-level method called by other client methods.
  dispatchXhr: (xhr, callback) ->
    xhr.setCallback callback
    xhr.prepare()
    nativeXhr = xhr.xhr
    if @filter
      return nativeXhr unless @filter(nativeXhr, xhr)
    xhr.send()
    nativeXhr

  # @private
  # @return {String} the URL to the default value for the "server" option
  defaultApiServer: ->
    'https://api.dropbox.com'

  # @private
  # @return {String} the URL to the default value for the "authServer" option
  defaultAuthServer: ->
    @apiServer.replace 'api.', 'www.'

  # @private
  # @return {String} the URL to the default value for the "fileServer" option
  defaultFileServer: ->
    @apiServer.replace 'api.', 'api-content.'

  # @private
  # @return {String} the URL to the default value for the "downloadServer"
  #     option
  defaultDownloadServer: ->
    @apiServer.replace 'api.', 'dl.'

  # Computes the cached value returned by credentials.
  #
  # @private
  # @see Dropbox.Client#computeCredentials
  computeCredentials: ->
    value =
      key: @oauth.key
      sandbox: @sandbox
    value.secret = @oauth.secret if @oauth.secret
    if @oauth.token
      value.token = @oauth.token
      value.tokenSecret = @oauth.tokenSecret
    value.uid = @uid if @uid
    if @authState isnt DropboxClient.ERROR and
       @authState isnt DropboxClient.RESET and
       @authState isnt DropboxClient.DONE and
       @authState isnt DropboxClient.SIGNED_OFF
      value.authState = @authState
    if @apiServer isnt @defaultApiServer()
      value.server = @apiServer
    if @authServer isnt @defaultAuthServer()
      value.authServer = @authServer
    if @fileServer isnt @defaultFileServer()
      value.fileServer = @fileServer
    if @downloadServer isnt @defaultDownloadServer()
      value.downloadServer = @downloadServer
    @_credentials = value

DropboxClient = Dropbox.Client
