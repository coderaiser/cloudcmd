# Documentation for the interface to a Dropbox OAuth driver.
class Dropbox.AuthDriver
  # The callback URL that should be supplied to the OAuth /authorize call.
  #
  # The driver must be able to intercept redirects to the returned URL, in
  # order to know when a user has completed the authorization flow.
  #
  # @return {String} an absolute URL
  url: ->
    'https://some.url'

  # Redirects users to /authorize and waits for them to complete the flow.
  #
  # This method is called when the OAuth process reaches the REQUEST state,
  # meaning the client has a request token that must be authorized by the user.
  #
  # @param {String} authUrl the URL that users should be sent to in order to
  #   authorize the application's token; this points to a Web page on
  #   Dropbox' servers
  # @param {String} token the OAuth token that the user is authorizing; this
  #   will be provided by the Dropbox servers as a query parameter when the
  #   user is redirected to the URL returned by the driver's url() method
  # @param {String} tokenSecret the secret associated with the given OAuth
  #   token; the driver may store this together with the token
  # @param {function()} callback called when users have completed the
  #   authorization flow; the driver should call this when Dropbox redirects
  #   users to the URL returned by the url() method, and the 'token' query
  #   parameter matches the value of the token parameter
  doAuthorize: (authUrl, token, tokenSecret, callback) ->
    callback 'oauth-token'

  # Called when there is some progress in the OAuth process.
  #
  # The OAuth process goes through the following states:
  #
  # * Dropbox.Client.RESET - the client has no OAuth token, and is about to
  #   ask for a request token
  # * Dropbox.Client.REQUEST - the client has a request OAuth token, and the
  #   user must go to an URL on the Dropbox servers to authorize the token
  # * Dropbox.Client.AUTHORIZED - the client has a request OAuth token that
  #   was authorized by the user, and is about to exchange it for an access
  #   token
  # * Dropbox.Client.DONE - the client has an access OAuth token that can be
  #   used for all API calls; the OAuth process is complete, and the callback
  #   passed to authorize is about to be called
  # * Dropbox.Client.SIGNED_OFF - the client's Dropbox.Client#signOut() was
  #   called, and the client's OAuth token was invalidated
  # * Dropbox.Client.ERROR - the client encounered an error during the OAuth
  #   process; the callback passed to authorize is about to be called with the
  #   error information
  #
  # @param {Dropbox.Client} client the client performing the OAuth process
  # @param {function()} callback called when onAuthStateChange acknowledges the
  #   state change
  onAuthStateChange: (client, callback) ->
    callback()

# Namespace for authentication drivers.
Dropbox.Drivers = {}
