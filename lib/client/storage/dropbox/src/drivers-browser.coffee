# Base class for drivers that run in the browser.
#
# Inheriting from this class makes a driver use HTML5 localStorage to preserve
# OAuth tokens across page reloads.
class Dropbox.Drivers.BrowserBase
  # Sets up the OAuth driver.
  #
  # Subclasses should pass the options object they receive to the superclass
  # constructor.
  #
  # @param {?Object} options the advanced settings below
  # @option options {Boolean} rememberUser if true, the user's OAuth tokens are
  #   saved in localStorage; if you use this, you MUST provide a UI item that
  #   calls signOut() on Dropbox.Client, to let the user "log out" of the
  #   application
  # @option options {String} scope embedded in the localStorage key that holds
  #   the authentication data; useful for having multiple OAuth tokens in a
  #   single application
  constructor: (options) ->
    @rememberUser = options?.rememberUser or false
    @scope = options?.scope or 'default'
    @storageKey = null

  # The magic happens here.
  onAuthStateChange: (client, callback) ->
    @setStorageKey client

    switch client.authState
      when DropboxClient.RESET
        @loadCredentials (credentials) =>
          return callback() unless credentials

          if credentials.authState  # Incomplete authentication.
            client.setCredentials credentials
            return callback()

          # There is an old access token. Only use it if the app supports
          # logout.
          unless @rememberUser
            @forgetCredentials()
            return callback()

          # Verify that the old access token still works.
          client.setCredentials credentials
          client.getUserInfo (error) =>
            if error
              client.reset()
              @forgetCredentials callback
            else
              callback()
      when DropboxClient.REQUEST
        @storeCredentials client.credentials(), callback
      when DropboxClient.DONE
        if @rememberUser
          return @storeCredentials(client.credentials(), callback)
        @forgetCredentials callback
      when DropboxClient.SIGNED_OFF
        @forgetCredentials callback
      when DropboxClient.ERROR
        @forgetCredentials callback
      else
        callback()
        @

  # Computes the @storageKey used by loadCredentials and forgetCredentials.
  #
  # @private
  # This is called by onAuthStateChange.
  #
  # @param {Dropbox.Client} client the client instance that is running the
  #     authorization process
  # @return {Dropbox.Driver} this, for easy call chaining
  setStorageKey: (client) ->
    # NOTE: the storage key is dependent on the app hash so that multiple apps
    #       hosted off the same server don't step on eachother's toes
    @storageKey = "dropbox-auth:#{@scope}:#{client.appHash()}"
    @

  # Stores a Dropbox.Client's credentials to localStorage.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {Object} credentials the result of a Drobpox.Client#credentials call
  # @param {function()} callback called when the storing operation is complete
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  storeCredentials: (credentials, callback) ->
    localStorage.setItem @storageKey, JSON.stringify(credentials)
    callback()
    @

  # Retrieves a token and secret from localStorage.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {function(?Object)} callback supplied with the credentials object
  #   stored by a previous call to
  #   Dropbox.Drivers.BrowserBase#storeCredentials; null if no credentials were
  #   stored, or if the previously stored credentials were deleted
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  loadCredentials: (callback) ->
    jsonString = localStorage.getItem @storageKey
    unless jsonString
      callback null
      return @

    try
      callback JSON.parse(jsonString)
    catch e
      # Parse errors.
      callback null
    @

  # Deletes information previously stored by a call to storeCredentials.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {function()} callback called after the credentials are deleted
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  forgetCredentials: (callback) ->
    localStorage.removeItem @storageKey
    callback()
    @

  # Wrapper for window.location, for testing purposes.
  #
  # @return {String} the current page's URL
  @currentLocation: ->
    window.location.href

# OAuth driver that uses a redirect and localStorage to complete the flow.
class Dropbox.Drivers.Redirect extends Dropbox.Drivers.BrowserBase
  # Sets up the redirect-based OAuth driver.
  #
  # @param {?Object} options the advanced settings below
  # @option options {Boolean} useQuery if true, the page will receive OAuth
  #   data as query parameters; by default, the page receives OAuth data in
  #   the fragment part of the URL (the string following the #,
  #   available as document.location.hash), to avoid confusing the server
  #   generating the page
  # @option options {Boolean} rememberUser if true, the user's OAuth tokens are
  #   saved in localStorage; if you use this, you MUST provide a UI item that
  #   calls signOut() on Dropbox.Client, to let the user "log out" of the
  #   application
  # @option options {String} scope embedded in the localStorage key that holds
  #   the authentication data; useful for having multiple OAuth tokens in a
  #   single application
  constructor: (options) ->
    super options
    @useQuery = options?.useQuery or false
    @receiverUrl = @computeUrl options
    @tokenRe = new RegExp "(#|\\?|&)oauth_token=([^&#]+)(&|#|$)"

  # Forwards the authentication process from REQUEST to AUTHORIZED on redirect.
  onAuthStateChange: (client, callback) ->
    superCall = do => => super client, callback
    @setStorageKey client
    if client.authState is DropboxClient.RESET
      @loadCredentials (credentials) =>
        if credentials and credentials.authState  # Incomplete authentication.
          if credentials.token is @locationToken() and
              credentials.authState is DropboxClient.REQUEST
            # locationToken matched, so the redirect happened
            credentials.authState = DropboxClient.AUTHORIZED
            return @storeCredentials credentials, superCall
          else
            # The authentication process broke down, start over.
            return @forgetCredentials superCall
        superCall()
    else
      superCall()

  # URL of the current page, since the user will be sent right back.
  url: ->
    @receiverUrl

  # Redirects to the authorize page.
  doAuthorize: (authUrl) ->
    window.location.assign authUrl

  # Pre-computes the return value of url.
  computeUrl: ->
    querySuffix = "_dropboxjs_scope=#{encodeURIComponent @scope}"
    location = Dropbox.Drivers.BrowserBase.currentLocation()
    if location.indexOf('#') is -1
      fragment = null
    else
      locationPair = location.split '#', 2
      location = locationPair[0]
      fragment = locationPair[1]
    if @useQuery
      if location.indexOf('?') is -1
        location += "?#{querySuffix}"  # No query string in the URL.
      else
        location += "&#{querySuffix}"  # The URL already has a query string.
    else
      fragment = "?#{querySuffix}"

    if fragment
      location + '#' + fragment
    else
      location

  # Figures out if the user completed the OAuth flow based on the current URL.
  #
  # @return {?String} the OAuth token that the user just authorized, or null if
  #   the user accessed this directly, without having authorized a token
  locationToken: ->
    location = Dropbox.Drivers.BrowserBase.currentLocation()

    # Check for the scope.
    scopePattern = "_dropboxjs_scope=#{encodeURIComponent @scope}&"
    return null if location.indexOf?(scopePattern) is -1

    # Extract the token.
    match = @tokenRe.exec location
    if match then decodeURIComponent(match[2]) else null

# OAuth driver that uses a popup window and postMessage to complete the flow.
class Dropbox.Drivers.Popup extends Dropbox.Drivers.BrowserBase
  # Sets up a popup-based OAuth driver.
  #
  # @param {?Object} options one of the settings below; leave out the argument
  #   to use the current location for redirecting
  # @option options {Boolean} rememberUser if true, the user's OAuth tokens are
  #   saved in localStorage; if you use this, you MUST provide a UI item that
  #   calls signOut() on Dropbox.Client, to let the user "log out" of the
  #   application
  # @option options {String} scope embedded in the localStorage key that holds
  #   the authentication data; useful for having multiple OAuth tokens in a
  #   single application
  # @option options {String} receiverUrl URL to the page that receives the
  #   /authorize redirect and performs the postMessage
  # @option options {Boolean} noFragment if true, the receiverUrl will be used
  #   as given; by default, a hash "#" is appended to URLs that don't have
  #   one, so the OAuth token is received as a URL fragment and does not hit
  #   the file server
  # @option options {String} receiverFile the URL to the receiver page will be
  #   computed by replacing the file name (everything after the last /) of
  #   the current location with this parameter's value
  constructor: (options) ->
    super options
    @receiverUrl = @computeUrl options
    @tokenRe = new RegExp "(#|\\?|&)oauth_token=([^&#]+)(&|#|$)"

  # Removes credentials stuck in the REQUEST stage.
  onAuthStateChange: (client, callback) ->
    superCall = do => => super client, callback
    @setStorageKey client
    if client.authState is DropboxClient.RESET
      @loadCredentials (credentials) =>
        if credentials and credentials.authState  # Incomplete authentication.
          # The authentication process broke down, start over.
          return @forgetCredentials superCall
        superCall()
    else
      superCall()

  # Shows the authorization URL in a pop-up, waits for it to send a message.
  doAuthorize: (authUrl, token, tokenSecret, callback) ->
    @listenForMessage token, callback
    @openWindow authUrl

  # URL of the redirect receiver page, which posts a message back to this page.
  url: ->
    @receiverUrl

  # Pre-computes the return value of url.
  computeUrl: (options) ->
    if options
      if options.receiverUrl
        if options.noFragment or options.receiverUrl.indexOf('#') isnt -1
          return options.receiverUrl
        else
          return options.receiverUrl + '#'
      else if options.receiverFile
        fragments = Dropbox.Drivers.BrowserBase.currentLocation().split '/'
        fragments[fragments.length - 1] = options.receiverFile
        if options.noFragment
          return fragments.join('/')
        else
          return fragments.join('/') + '#'
    Dropbox.Drivers.BrowserBase.currentLocation()

  # Creates a popup window.
  #
  # @param {String} url the URL that will be loaded in the popup window
  # @return {?DOMRef} reference to the opened window, or null if the call
  #   failed
  openWindow: (url) ->
    window.open url, '_dropboxOauthSigninWindow', @popupWindowSpec(980, 700)

  # Spec string for window.open to create a nice popup.
  #
  # @param {Number} popupWidth the desired width of the popup window
  # @param {Number} popupHeight the desired height of the popup window
  # @return {String} spec string for the popup window
  popupWindowSpec: (popupWidth, popupHeight) ->
    # Metrics for the current browser window.
    x0 = window.screenX ? window.screenLeft
    y0 = window.screenY ? window.screenTop
    width = window.outerWidth ? document.documentElement.clientWidth
    height = window.outerHeight ? document.documentElement.clientHeight

    # Computed popup window metrics.
    popupLeft = Math.round x0 + (width - popupWidth) / 2
    popupTop = Math.round y0 + (height - popupHeight) / 2.5
    popupLeft = x0 if popupLeft < x0
    popupTop = y0 if popupTop < y0

    # The specification string.
    "width=#{popupWidth},height=#{popupHeight}," +
      "left=#{popupLeft},top=#{popupTop}" +
      'dialog=yes,dependent=yes,scrollbars=yes,location=yes'

  # Listens for a postMessage from a previously opened popup window.
  #
  # @param {String} token the token string that must be received from the popup
  #   window
  # @param {function()} called when the received message matches the token
  listenForMessage: (token, callback) ->
    listener = (event) =>
      match = @tokenRe.exec event.data.toString()
      if match and decodeURIComponent(match[2]) is token
        window.removeEventListener 'message', listener
        callback()
    window.addEventListener 'message', listener, false

  # Communicates with the driver from the OAuth receiver page.
  @oauthReceiver: ->
    window.addEventListener 'load', ->
      opener = window.opener
      if window.parent isnt window.top
        opener or= window.parent
      if opener
        try
          opener.postMessage window.location.href, '*'
        catch e
          # IE 9 doesn't support opener.postMessage for popup windows.
        window.close()
