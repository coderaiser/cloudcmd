# Tracks the progress of a resumable upload.
class Dropbox.UploadCursor
  # Creates an UploadCursor instance from an API response.
  #
  # @param {?Object, ?String} cursorData the parsed JSON describing the status
  #   of a partial upload, or the upload ID string
  @parse: (cursorData) ->
    if cursorData and (typeof cursorData is 'object' or
                       typeof cursorData is 'string')
      new Dropbox.UploadCursor cursorData
    else
      cursorData

  # @property {String} the server-generated ID for this upload
  tag: null

  # @property {Number} number of bytes that have already been uploaded
  offset: null

  # @property {Date} deadline for finishing the upload
  expiresAt: null

  # JSON representation of this cursor.
  #
  # @return {Object} conforms to the JSON restrictions; can be passed to
  #   Dropbox.UploadCursor#parse to obtain an identical UploadCursor instance
  json: ->
    # NOTE: the assignment only occurs if
    @_json ||= upload_id: @tag, offset: @offset, expires: @expiresAt.toString()

  # Creates an UploadCursor instance from a raw reference or API response.
  #
  # This constructor should only be called directly to obtain a cursor for a
  # new file upload. Dropbox.UploadCursor#parse should be called instead
  #
  # @param {?Object, ?String} cursorData the parsed JSON describing a copy
  #   reference, or the reference string
  constructor: (cursorData) ->
    @replace cursorData

  # Replaces the current
  #
  # @private Called by Dropbox.Client#resumableUploadStep.
  #
  # @param {?Object, ?String} cursorData the parsed JSON describing a copy
  #   reference, or the reference string
  # @return {Dropbox.UploadCursor} this
  replace: (cursorData) ->
    if typeof cursorData is 'object'
      @tag = cursorData.upload_id or null
      @offset = cursorData.offset or 0
      @expiresAt = new Date(Date.parse(cursorData.expires) or Date.now())
      @_json = cursorData
    else
      @tag = cursorData or null
      @offset = 0
      @expiresAt = new Date Math.floor(Date.now() / 1000) * 1000
      @_json = null
    @
