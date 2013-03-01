DropboxChromeOnMessage = null
DropboxChromeSendMessage = null

if chrome?
  # v2 manifest APIs.
  if chrome.runtime
    if chrome.runtime.onMessage
      DropboxChromeOnMessage = chrome.runtime.onMessage
    if chrome.runtime.sendMessage
      DropboxChromeSendMessage = (m) -> chrome.runtime.sendMessage m

  # v1 manifest APIs.
  if chrome.extension
    if chrome.extension.onMessage
      DropboxChromeOnMessage or= chrome.extension.onMessage
    if chrome.extension.sendMessage
      DropboxChromeSendMessage or= (m) -> chrome.extension.sendMessage m

  # Apps that use the v2 manifest don't get messenging in Chrome 25.
  unless DropboxChromeOnMessage
    do ->
      pageHack = (page) ->
        if page.Dropbox
          Dropbox.Drivers.Chrome::onMessage =
              page.Dropbox.Drivers.Chrome.onMessage
          Dropbox.Drivers.Chrome::sendMessage =
              page.Dropbox.Drivers.Chrome.sendMessage
        else
          page.Dropbox = Dropbox
          Dropbox.Drivers.Chrome::onMessage = new Dropbox.EventSource
          Dropbox.Drivers.Chrome::sendMessage =
              (m) -> Dropbox.Drivers.Chrome::onMessage.dispatch m

      if chrome.extension and chrome.extension.getBackgroundPage
        if page = chrome.extension.getBackgroundPage()
          return pageHack(page)

      if chrome.runtime and chrome.runtime.getBackgroundPage
        return chrome.runtime.getBackgroundPage (page) -> pageHack page

# OAuth driver specialized for Chrome apps and extensions.
class Dropbox.Drivers.Chrome
  # @property {Chrome.Event<>, Dropbox.EventSource<>} fires non-cancelable
  #   events when Dropbox.Drivers.Chrome#sendMessage is called
  onMessage: DropboxChromeOnMessage

  # Sends a message across the Chrome extension / application.
  #
  # When a message is sent, the listeners registered to
  #
  # @param {Object} message the message to be sent
  sendMessage: DropboxChromeSendMessage

  # Expans an URL relative to the Chrome extension / application root.
  #
  # @param {String} url a resource URL relative to the extension root
  # @return {String} the absolute resource URL
  expandUrl: (url) ->
    if chrome.runtime and chrome.runtime.getURL
      return chrome.runtime.getURL(url)
    if chrome.extension and chrome.extension.getURL
      return chrome.extension.getURL(url)
    url

  # @param {?Object} options the settings below
  # @option {String} receiverPath the path of page that receives the /authorize
  #   redirect and performs the postMessage; the path should be relative to the
  #   extension folder; by default, is 'chrome_oauth_receiver.html'
  constructor: (options) ->
    receiverPath = (options and options.receiverPath) or
        'chrome_oauth_receiver.html'
    @receiverUrl = @expandUrl receiverPath
    @tokenRe = new RegExp "(#|\\?|&)oauth_token=([^&#]+)(&|#|$)"
    scope = (options and options.scope) or 'default'
    @storageKey = "dropbox_js_#{scope}_credentials"

  # Saves token information when appropriate.
  onAuthStateChange: (client, callback) ->
    switch client.authState
      when Dropbox.Client.RESET
        @loadCredentials (credentials) =>
          if credentials
            if credentials.authState
              # Stuck authentication process, reset.
              return @forgetCredentials(callback)
            client.setCredentials credentials
          callback()
      when Dropbox.Client.DONE
        @storeCredentials client.credentials(), callback
      when Dropbox.Client.SIGNED_OFF
        @forgetCredentials callback
      when Dropbox.Client.ERROR
        @forgetCredentials callback
      else
        callback()

  # Shows the authorization URL in a pop-up, waits for it to send a message.
  doAuthorize: (authUrl, token, tokenSecret, callback) ->
    window = handle: null
    @listenForMessage token, window, callback
    @openWindow authUrl, (handle) -> window.handle = handle

  # Creates a popup window.
  #
  # @param {String} url the URL that will be loaded in the popup window
  # @param {function(Object)} callback called with a handle that can be passed
  #   to Dropbox.Driver.Chrome#closeWindow
  # @return {Dropbox.Driver.Chrome} this
  openWindow: (url, callback) ->
    if chrome.tabs and chrome.tabs.create
      chrome.tabs.create url: url, active: true, pinned: false, (tab) ->
        callback tab
      return @
    if chrome.app and chrome.app.window and chrome.app.window.create
      chrome.app.window.create url, frame: 'none', id: 'dropbox-auth',
          (window) -> callback window
      return @
    @

  # Closes a window that was previously opened with openWindow.
  #
  # @param {Object} handle the object passed to an openWindow callback
  closeWindow: (handle) ->
    if chrome.tabs and chrome.tabs.remove and handle.id
      chrome.tabs.remove handle.id
      return @
    if chrome.app and chrome.app.window and handle.close
      handle.close()
      return @
    @

  # URL of the redirect receiver page that messages the app / extension.
  url: ->
    @receiverUrl

  # Listens for a postMessage from a previously opened tab.
  #
  # @param {String} token the token string that must be received from the tab
  # @param {Object} window a JavaScript object whose "handle" property is a
  #   window handle passed to the callback of a
  #   Dropbox.Driver.Chrome#openWindow call
  # @param {function()} called when the received message matches the token
  listenForMessage: (token, window, callback) ->
    listener = (message, sender) =>
      # Reject messages not coming from the OAuth receiver window.
      if sender and sender.tab
        unless sender.tab.url.substring(0, @receiverUrl.length) is @receiverUrl
          return

      match = @tokenRe.exec message.dropbox_oauth_receiver_href or ''
      if match and decodeURIComponent(match[2]) is token
        @closeWindow window.handle if window.handle
        @onMessage.removeListener listener
        callback()
    @onMessage.addListener listener

  # Stores a Dropbox.Client's credentials to local storage.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {Object} credentials the result of a Drobpox.Client#credentials call
  # @param {function()} callback called when the storing operation is complete
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  storeCredentials: (credentials, callback) ->
    items= {}
    items[@storageKey] = credentials
    chrome.storage.local.set items, callback
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
    chrome.storage.local.get @storageKey, (items) =>
      callback items[@storageKey] or null
    @

  # Deletes information previously stored by a call to storeCredentials.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {function()} callback called after the credentials are deleted
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  forgetCredentials: (callback) ->
    chrome.storage.local.remove @storageKey, callback
    @

  # Communicates with the driver from the OAuth receiver page.
  @oauthReceiver: ->
    window.addEventListener 'load', ->
      driver = new Dropbox.Drivers.Chrome()
      driver.sendMessage dropbox_oauth_receiver_href: window.location.href
      window.close() if window.close
