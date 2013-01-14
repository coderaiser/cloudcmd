# Wraps an URL to a Dropbox file or folder that can be publicly shared.
class Dropbox.PublicUrl
  # Creates a PublicUrl instance from a raw API response.
  #
  # @param {?Object, ?String} urlData the parsed JSON describing a public URL
  # @param {?Boolean} isDirect true if this is a direct download link, false if
  #   is a file / folder preview link
  # @return {?Dropbox.PublicUrl} a PublicUrl instance wrapping the given public
  #   link info; parameters that don't look like parsed JSON are returned as
  #   they are
  @parse: (urlData, isDirect) ->
    if urlData and typeof urlData is 'object'
      new Dropbox.PublicUrl urlData, isDirect
    else
      urlData

  # @property {String} the public URL
  url: null

  # @property {Date} after this time, the URL is not usable
  expiresAt: null

  # @property {Boolean} true if this is a direct download URL, false for URLs to
  #   preview pages in the Dropbox web app; folders do not have direct link
  #
  isDirect: null

  # @property {Boolean} true if this is URL points to a file's preview page in
  #   Dropbox, false for direct links
  isPreview: null

  # JSON representation of this file / folder's metadata
  #
  # @return {Object} conforms to the JSON restrictions; can be passed to
  #   Dropbox.PublicUrl#parse to obtain an identical PublicUrl instance
  json: ->
    # HACK: this can break if the Dropbox API ever decides to use 'direct' in
    #       its link info
    @_json ||= url: @url, expires: @expiresAt.toString(), direct: @isDirect

  # Creates a PublicUrl instance from a raw API response.
  #
  # @private
  # This constructor is used by Dropbox.PublicUrl.parse, and should not be
  # called directly.
  #
  # @param {?Object} urlData the parsed JSON describing a public URL
  # @param {Boolean} isDirect true if this is a direct download link, false if
  #   is a file / folder preview link
  constructor: (urlData, isDirect) ->
    @url = urlData.url
    @expiresAt = new Date Date.parse(urlData.expires)

    if isDirect is true
      @isDirect = true
    else if isDirect is false
      @isDirect = false
    else
      # HACK: this can break if the Dropbox API ever decides to use 'direct' in
      #       its link info; unfortunately, there's no elegant way to guess
      #       between direct download URLs and preview URLs
      if 'direct' of urlData
        @isDirect = urlData.direct
      else
        @isDirect = Date.now() - @expiresAt <= 86400000  # 1 day
    @isPreview = !@isDirect

    # The JSON representation is created on-demand, to avoid unnecessary object
    # creation.
    # We can't use the original JSON object because we add a 'direct' field.
    @_json = null

# Reference to a file that can be used to make a copy across users' Dropboxes.
class Dropbox.CopyReference
  # Creates a CopyReference instance from a raw reference or API response.
  #
  # @param {?Object, ?String} refData the parsed JSON describing a copy
  #   reference, or the reference string
  @parse: (refData) ->
    if refData and (typeof refData is 'object' or typeof refData is 'string')
      new Dropbox.CopyReference refData
    else
      refData

  # @property {String} the raw reference, for use with Dropbox APIs
  tag: null

  # @property {Date} deadline for using the reference in a copy operation
  expiresAt: null

  # JSON representation of this file / folder's metadata
  #
  # @return {Object} conforms to the JSON restrictions; can be passed to
  #   Dropbox.CopyReference#parse to obtain an identical CopyReference instance
  json: ->
    # NOTE: the assignment only occurs if the CopyReference was built around a
    #       string; CopyReferences parsed from API responses hold onto the
    #       original JSON
    @_json ||= copy_ref: @tag, expires: @expiresAt.toString()

  # Creates a CopyReference instance from a raw reference or API response.
  #
  # @private
  # This constructor is used by Dropbox.CopyReference.parse, and should not be
  # called directly.
  #
  # @param {Object, String} refData the parsed JSON describing a copy
  #   reference, or the reference string
  constructor: (refData) ->
    if typeof refData is 'object'
      @tag = refData.copy_ref
      @expiresAt = new Date Date.parse(refData.expires)
      @_json = refData
    else
      @tag = refData
      @expiresAt = new Date Math.ceil(Date.now() / 1000) * 1000
      # The JSON representation is created on-demand, to avoid unnecessary
      # object creation.
      @_json = null
