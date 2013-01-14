if window?
  if window.XDomainRequest and not ('withCredentials' of new XMLHttpRequest())
    DropboxXhrRequest = window.XDomainRequest
    DropboxXhrIeMode = true
    # IE's XDR doesn't allow setting requests' Content-Type to anything other
    # than text/plain, so it can't send _any_ forms.
    DropboxXhrCanSendForms = false
  else
    DropboxXhrRequest = window.XMLHttpRequest
    DropboxXhrIeMode = false
    # Firefox doesn't support adding named files to FormData.
    # https://bugzilla.mozilla.org/show_bug.cgi?id=690659
    DropboxXhrCanSendForms =
      window.navigator.userAgent.indexOf('Firefox') is -1
  DropboxXhrDoesPreflight = true
else
  # Node.js needs an adapter for the XHR API.
  DropboxXhrRequest = require('xmlhttprequest').XMLHttpRequest
  DropboxXhrIeMode = false
  # Node.js doesn't have FormData. We wouldn't want to bother putting together
  # upload forms in node.js anyway, because it doesn't do CORS preflight
  # checks, so we can use PUT requests without a performance hit.
  DropboxXhrCanSendForms = false
  # Node.js is a server so it doesn't do annoying browser checks.
  DropboxXhrDoesPreflight = false

# ArrayBufferView isn't available in the global namespce.
#
# Using the hack suggested in
#     https://code.google.com/p/chromium/issues/detail?id=60449
if typeof Uint8Array is 'undefined'
  DropboxXhrArrayBufferView = null
  DropboxXhrSendArrayBufferView = false
else
  if Object.getPrototypeOf
    DropboxXhrArrayBufferView = Object.getPrototypeOf(
        Object.getPrototypeOf(new Uint8Array(0))).constructor
  else if Object.__proto__
    DropboxXhrArrayBufferView =
        (new Uint8Array(0)).__proto__.__proto__.constructor

  # Browsers that haven't implemented XHR#send(ArrayBufferView) also don't
  # have a real ArrayBufferView prototype. (Safari, Firefox)
  DropboxXhrSendArrayBufferView = DropboxXhrArrayBufferView isnt Object

# Dispatches low-level AJAX calls (XMLHttpRequests).
class Dropbox.Xhr
  # The object used to perform AJAX requests (XMLHttpRequest).
  @Request = DropboxXhrRequest
  # Set to true when using the XDomainRequest API.
  @ieXdr = DropboxXhrIeMode
  # Set to true if the platform has proper support for FormData.
  @canSendForms = DropboxXhrCanSendForms
  # Set to true if the platform performs CORS preflight checks.
  @doesPreflight = DropboxXhrDoesPreflight
  # Superclass for all ArrayBufferView objects.
  @ArrayBufferView = DropboxXhrArrayBufferView
  # Set to true if we think we can send ArrayBufferView objects via XHR.
  @sendArrayBufferView = DropboxXhrSendArrayBufferView


  # Sets up an AJAX request.
  #
  # @param {String} method the HTTP method used to make the request ('GET',
  #   'POST', 'PUT', etc.)
  # @param {String} baseUrl the URL that receives the request; this URL might
  #   be modified, e.g. by appending parameters for GET requests
  constructor: (@method, baseUrl) ->
    @isGet = @method is 'GET'
    @url = baseUrl
    @headers = {}
    @params = null
    @body = null
    @preflight = not (@isGet or (@method is 'POST'))
    @signed = false
    @responseType = null
    @callback = null
    @xhr = null
    @onError = null

  # @property {?XMLHttpRequest} the raw XMLHttpRequest object used to make the
  #   request; null until Dropbox.Xhr#prepare is called
  xhr: null

  # @property {?Dropbox.EventSource<Dropbox.ApiError>} if the XHR fails and
  #   this property is set, the Dropbox.ApiError instance that will be passed
  #   to the callback will be dispatched through the Dropbox.EventSource; the
  #   EventSource should be configured for non-cancelable events
  onError: null

  # Sets the parameters (form field values) that will be sent with the request.
  #
  # @param {?Object} params an associative array (hash) containing the HTTP
  #   request parameters
  # @return {Dropbox.Xhr} this, for easy call chaining
  setParams: (params) ->
    if @signed
      throw new Error 'setParams called after addOauthParams or addOauthHeader'
    if @params
      throw new Error 'setParams cannot be called twice'
    @params = params
    @

  # Sets the function called when the XHR completes.
  #
  # This function can also be set when calling Dropbox.Xhr#send.
  #
  # @param {function(?Dropbox.ApiError, ?Object, ?Object)} callback called when
  #   the XHR completes; if an error occurs, the first parameter will be a
  #   Dropbox.ApiError instance; otherwise, the second parameter will be an
  #   instance of the required response type (e.g., String, Blob), and the
  #   third parameter will be the JSON-parsed 'x-dropbox-metadata' header
  # @return {Dropbox.Xhr} this, for easy call chaining
  setCallback: (@callback) ->
    @

  # Ammends the request parameters to include an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # This method automatically decides the best way to add the OAuth signature
  # to the current request. Modifying the request in any way (e.g., by adding
  # headers) might result in a valid signature that is applied in a sub-optimal
  # fashion. For best results, call this right before Dropbox.Xhr#prepare.
  #
  # @param {Dropbox.Oauth} oauth OAuth instance whose key and secret will be
  #   used to sign the request
  # @param {Boolean} cacheFriendly if true, the signing process choice will be
  #   biased towards allowing the HTTP cache to work; by default, the choice
  #   attempts to avoid the CORS preflight request whenever possible
  # @return {Dropbox.Xhr} this, for easy call chaining
  signWithOauth: (oauth, cacheFriendly) ->
    if Dropbox.Xhr.ieXdr
      @addOauthParams oauth
    else if @preflight or !Dropbox.Xhr.doesPreflight
      @addOauthHeader oauth
    else
      if @isGet and cacheFriendly
        @addOauthHeader oauth
      else
        @addOauthParams oauth

  # Ammends the request parameters to include an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # @param {Dropbox.Oauth} oauth OAuth instance whose key and secret will be
  #   used to sign the request
  # @return {Dropbox.Xhr} this, for easy call chaining
  addOauthParams: (oauth) ->
    if @signed
      throw new Error 'Request already has an OAuth signature'

    @params or= {}
    oauth.addAuthParams @method, @url, @params
    @signed = true
    @

  # Adds an Authorize header containing an OAuth signature.
  #
  # The OAuth signature will become invalid if the parameters are changed after
  # the signing process.
  #
  # @param {Dropbox.Oauth} oauth OAuth instance whose key and secret will be
  #   used to sign the request
  # @return {Dropbox.Xhr} this, for easy call chaining
  addOauthHeader: (oauth) ->
    if @signed
      throw new Error 'Request already has an OAuth signature'

    @params or= {}
    @signed = true
    @setHeader 'Authorization', oauth.authHeader(@method, @url, @params)

  # Sets the body (piece of data) that will be sent with the request.
  #
  # @param {String, Blob, ArrayBuffer} body the body to be sent in a request;
  #   GET requests cannot have a body
  # @return {Dropbox.Xhr} this, for easy call chaining
  setBody: (body) ->
    if @isGet
      throw new Error 'setBody cannot be called on GET requests'
    if @body isnt null
      throw new Error 'Request already has a body'

    if typeof body is 'string'
      # Content-Type will be set automatically.
    else if (typeof FormData isnt 'undefined') and (body instanceof FormData)
      # Content-Type will be set automatically.
    else
      @headers['Content-Type'] = 'application/octet-stream'
      @preflight = true

    @body = body
    @

  # Sends off an AJAX request and requests a custom response type.
  #
  # This method requires XHR Level 2 support, which is not available in IE
  # versions <= 9. If these browsers must be supported, it is recommended to
  # check whether window.Blob is truthy.
  #
  # @param {String} responseType the value that will be assigned to the XHR's
  #   responseType property
  # @return {Dropbox.Xhr} this, for easy call chaining
  setResponseType: (@responseType) ->
    @

  # Sets the value of a custom HTTP header.
  #
  # Custom HTTP headers require a CORS preflight in browsers, so requests that
  # use them will take more time to complete, especially on high-latency mobile
  # connections.
  #
  # @param {String} headerName the name of the HTTP header
  # @param {String} value the value that the header will be set to
  # @return {Dropbox.Xhr} this, for easy call chaining
  setHeader: (headerName, value) ->
    if @headers[headerName]
      oldValue = @headers[headerName]
      throw new Error "HTTP header #{headerName} already set to #{oldValue}"
    if headerName is 'Content-Type'
      throw new Error 'Content-Type is automatically computed based on setBody'
    @preflight = true
    @headers[headerName] = value
    @

  # Simulates having an <input type="file"> being sent with the request.
  #
  # @param {String} fieldName the name of the form field / parameter (not of
  #   the uploaded file)
  # @param {String} fileName the name of the uploaded file (not the name of the
  #   form field / parameter)
  # @param {String, Blob, File} fileData contents of the file to be uploaded
  # @param {?String} contentType the MIME type of the file to be uploaded; if
  #   fileData is a Blob or File, its MIME type is used instead
  setFileField: (fieldName, fileName, fileData, contentType) ->
    if @body isnt null
      throw new Error 'Request already has a body'

    if @isGet
      throw new Error 'setFileField cannot be called on GET requests'

    if typeof(fileData) is 'object' and typeof Blob isnt 'undefined'
      if typeof ArrayBuffer isnt 'undefined'
        if fileData instanceof ArrayBuffer
          # Convert ArrayBuffer -> ArrayBufferView on standard-compliant
          # browsers, to avoid warnings from the Blob constructor.
          if Dropbox.Xhr.sendArrayBufferView
            fileData = new Uint8Array fileData
        else
          # Convert ArrayBufferView -> ArrayBuffer on older browsers, to avoid
          # having a Blob that contains "[object Uint8Array]" instead of the
          # actual data.
          if !Dropbox.Xhr.sendArrayBufferView and fileData.byteOffset is 0 and
             fileData.buffer instanceof ArrayBuffer
            fileData = fileData.buffer

      contentType or= 'application/octet-stream'
      fileData = new Blob [fileData], type: contentType

      # Workaround for http://crbug.com/165095
      if typeof File isnt 'undefined' and fileData instanceof File
        fileData = new Blob [fileData], type: fileData.type
        #fileData = fileData
      useFormData = fileData instanceof Blob
    else
      useFormData = false

    if useFormData
      @body = new FormData()
      @body.append fieldName, fileData, fileName
    else
      contentType or= 'application/octet-stream'
      boundary = @multipartBoundary()
      @headers['Content-Type'] = "multipart/form-data; boundary=#{boundary}"
      @body = ['--', boundary, "\r\n",
               'Content-Disposition: form-data; name="', fieldName,
                   '"; filename="', fileName, "\"\r\n",
               'Content-Type: ', contentType, "\r\n",
               "Content-Transfer-Encoding: binary\r\n\r\n",
               fileData,
               "\r\n", '--', boundary, '--', "\r\n"].join ''

  # @private
  # @return {String} a nonce suitable for use as a part boundary in a multipart
  #   MIME message
  multipartBoundary: ->
    [Date.now().toString(36), Math.random().toString(36)].join '----'

  # Moves this request's parameters to its URL.
  #
  # @private
  # @return {Dropbox.Xhr} this, for easy call chaining
  paramsToUrl: ->
    if @params
      queryString = Dropbox.Xhr.urlEncode @params
      if queryString.length isnt 0
        @url = [@url, '?', queryString].join ''
      @params = null
    @

  # Moves this request's parameters to its body.
  #
  # @private
  # @return {Dropbox.Xhr} this, for easy call chaining
  paramsToBody: ->
    if @params
      if @body isnt null
        throw new Error 'Request already has a body'
      if @isGet
        throw new Error 'paramsToBody cannot be called on GET requests'
      @headers['Content-Type'] = 'application/x-www-form-urlencoded'
      @body = Dropbox.Xhr.urlEncode @params
      @params = null
    @

  # Sets up an XHR request.
  #
  # This method completely sets up a native XHR object and stops short of
  # calling its send() method, so the API client has a chance of customizing
  # the XHR. After customizing the XHR, Dropbox.Xhr#send should be called.
  #
  #
  # @return {Dropbox.Xhr} this, for easy call chaining
  prepare: ->
    ieXdr = Dropbox.Xhr.ieXdr
    if @isGet or @body isnt null or ieXdr
      @paramsToUrl()
      if @body isnt null and typeof @body is 'string'
        @headers['Content-Type'] = 'text/plain; charset=utf8'
    else
      @paramsToBody()

    @xhr = new Dropbox.Xhr.Request()
    if ieXdr
      @xhr.onload = => @onXdrLoad()
      @xhr.onerror = => @onXdrError()
      @xhr.ontimeout = => @onXdrError()
      # NOTE: there are reports that XHR somtimes fails if onprogress doesn't
      #       have any handler
      @xhr.onprogress = ->
    else
      @xhr.onreadystatechange = => @onReadyStateChange()
    @xhr.open @method, @url, true

    unless ieXdr
      for own header, value of @headers
        @xhr.setRequestHeader header, value

    if @responseType
      if @responseType is 'b'
        if @xhr.overrideMimeType
          @xhr.overrideMimeType 'text/plain; charset=x-user-defined'
      else
        @xhr.responseType = @responseType

    @

  # Fires off the prepared XHR request.
  #
  # Dropbox.Xhr#prepare should be called exactly once before this method.
  #
  # @param {function(?Dropbox.ApiError, ?Object, ?Object)} callback called when
  #   the XHR completes; if an error occurs, the first parameter will be a
  #   Dropbox.ApiError instance; otherwise, the second parameter will be an
  #   instance of the required response type (e.g., String, Blob), and the
  #   third parameter will be the JSON-parsed 'x-dropbox-metadata' header
  # @return {Dropbox.Xhr} this, for easy call chaining
  send: (callback) ->
    @callback = callback or @callback

    if @body isnt null
      body = @body
      # send() in XHR doesn't like naked ArrayBuffers
      if Dropbox.Xhr.sendArrayBufferView and body instanceof ArrayBuffer
        body = new Uint8Array body

      try
        @xhr.send body
      catch e
        # Node.js doesn't implement Blob.
        if !Dropbox.Xhr.sendArrayBufferView and typeof Blob isnt 'undefined'
          # Firefox doesn't support sending ArrayBufferViews.
          body = new Blob [body], type: 'application/octet-stream'
          @xhr.send body
        else
          throw e
    else
      @xhr.send()
    @

  # Encodes an associative array (hash) into a x-www-form-urlencoded String.
  #
  # For consistency, the keys are sorted in alphabetical order in the encoded
  # output.
  #
  # @param {Object} object the JavaScript object whose keys will be encoded
  # @return {String} the object's keys and values, encoded using
  #   x-www-form-urlencoded
  @urlEncode: (object) ->
    chunks = []
    for key, value of object
      chunks.push @urlEncodeValue(key) + '=' + @urlEncodeValue(value)
    chunks.sort().join '&'

  # Encodes an object into a x-www-form-urlencoded key or value.
  #
  # @param {Object} object the object to be encoded; the encoding calls
  #   toString() on the object to obtain its string representation
  # @return {String} encoded string, suitable for use as a key or value in an
  #   x-www-form-urlencoded string
  @urlEncodeValue: (object) ->
    encodeURIComponent(object.toString()).replace(/\!/g, '%21').
      replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').
      replace(/\*/g, '%2A')

  # Decodes an x-www-form-urlencoded String into an associative array (hash).
  #
  # @param {String} string the x-www-form-urlencoded String to be decoded
  # @return {Object} an associative array whose keys and values are all strings
  @urlDecode: (string) ->
    result = {}
    for token in string.split '&'
      kvp = token.split '='
      result[decodeURIComponent(kvp[0])] = decodeURIComponent kvp[1]
    result

  # Handles the XHR readystate event.
  onReadyStateChange: ->
    return true if @xhr.readyState isnt 4  # XMLHttpRequest.DONE is 4

    if @xhr.status < 200 or @xhr.status >= 300
      apiError = new Dropbox.ApiError @xhr, @method, @url
      @onError.dispatch apiError if @onError
      @callback apiError
      return true

    metadataJson = @xhr.getResponseHeader 'x-dropbox-metadata'
    if metadataJson?.length
      try
        metadata = JSON.parse metadataJson
      catch e
        # Make sure the app doesn't crash if the server goes crazy.
        metadata = undefined
    else
      metadata = undefined

    if @responseType
      if @responseType is 'b'
        dirtyText = if @xhr.responseText?
          @xhr.responseText
        else
          @xhr.response
        ###
        jsString = ['["']
        for i in [0...dirtyText.length]
          hexByte = (dirtyText.charCodeAt(i) & 0xFF).toString(16)
          if hexByte.length is 2
            jsString.push "\\u00#{hexByte}"
          else
            jsString.push "\\u000#{hexByte}"
        jsString.push '"]'
        console.log jsString
        text = JSON.parse(jsString.join(''))[0]
        ###
        bytes = []
        for i in [0...dirtyText.length]
          bytes.push String.fromCharCode(dirtyText.charCodeAt(i) & 0xFF)
        text = bytes.join ''
        @callback null, text, metadata
      else
        @callback null, @xhr.response, metadata
      return true

    text = if @xhr.responseText? then @xhr.responseText else @xhr.response
    switch @xhr.getResponseHeader('Content-Type')
       when 'application/x-www-form-urlencoded'
         @callback null, Dropbox.Xhr.urlDecode(text), metadata
       when 'application/json', 'text/javascript'
         @callback null, JSON.parse(text), metadata
       else
          @callback null, text, metadata
    true

  # Handles the XDomainRequest onload event. (IE 8, 9)
  onXdrLoad: ->
    text = @xhr.responseText
    switch @xhr.contentType
     when 'application/x-www-form-urlencoded'
       @callback null, Dropbox.Xhr.urlDecode(text), undefined
     when 'application/json', 'text/javascript'
       @callback null, JSON.parse(text), undefined
     else
        @callback null, text, undefined
    true

  # Handles the XDomainRequest onload event. (IE 8, 9)
  onXdrError: ->
    apiError = new Dropbox.ApiError @xhr, @method, @url
    @onError.dispatch apiError if @onError
    @callback apiError
    return true
