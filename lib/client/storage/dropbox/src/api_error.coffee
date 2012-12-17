# Information about a failed call to the Dropbox API.
class Dropbox.ApiError
  # @property {Number} the HTTP error code (e.g., 403)
  status: undefined

  # @property {String} the HTTP method of the failed request (e.g., 'GET')
  method: undefined

  # @property {String} the URL of the failed request
  url: undefined

  # @property {?String} the body of the HTTP error response; can be null if
  #   the error was caused by a network failure or by a security issue
  responseText: undefined

  # @property {?Object} the result of parsing the JSON in the HTTP error
  #   response; can be null if the API server didn't return JSON, or if the
  #   HTTP response body is unavailable
  response: undefined

  # Wraps a failed XHR call to the Dropbox API.
  #
  # @param {String} method the HTTP verb of the API request (e.g., 'GET')
  # @param {String} url the URL of the API request
  # @param {XMLHttpRequest} xhr the XMLHttpRequest instance of the failed
  #   request
  constructor: (xhr, @method, @url) ->
    @status = xhr.status
    if xhr.responseType
      text = xhr.response or xhr.responseText
    else
      text = xhr.responseText
    if text
      try
        @responseText = text.toString()
        @response = JSON.parse text
      catch e
        @response = null
    else
      @responseText = '(no response)'
      @response = null

  # Used when the error is printed out by developers.
  toString: ->
    "Dropbox API error #{@status} from #{@method} #{@url} :: #{@responseText}"

  # Used by some testing frameworks.
  inspect: ->
    @toString()
