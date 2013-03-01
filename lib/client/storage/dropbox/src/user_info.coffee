# Information about a Dropbox user.
class Dropbox.UserInfo
  # Creates a UserInfo instance from a raw API response.
  #
  # @param {?Object} userInfo the result of parsing a JSON API response that
  #   describes a user
  # @return {Dropbox.UserInfo} a UserInfo instance wrapping the given API
  #   response; parameters that aren't parsed JSON objects are returned as
  #   the are
  @parse: (userInfo) ->
    if userInfo and typeof userInfo is 'object'
      new Dropbox.UserInfo userInfo
    else
      userInfo

  # @property {String} the user's name, in a form that is fit for display
  name: null

  # @property {?String} the user's email; this is not in the official API
  #   documentation, so it might not be supported
  email: null

  # @property {?String} two-letter country code, or null if unavailable
  countryCode: null

  # @property {String} unique ID for the user; this ID matches the unique ID
  #   returned by the authentication process
  uid: null

  # @property {String} the user's referral link; the user might benefit if
  #   others use the link to sign up for Dropbox
  referralUrl: null

  # Specific to applications whose access type is "public app folder".
  #
  # @property {String} prefix for URLs to the application's files
  publicAppUrl: null

  # @property {Number} the maximum amount of bytes that the user can store
  quota: null

  # @property {Number} the number of bytes taken up by the user's data
  usedQuota: null

  # @property {Number} the number of bytes taken up by the user's data that is
  #   not shared with other users
  privateBytes: null

  # @property {Number} the number of bytes taken up by the user's data that is
  #   shared with other users
  sharedBytes: null

  # JSON representation of this user's information.
  #
  # @return {Object} conforms to the JSON restrictions; can be passed to
  #   Dropbox.UserInfo#parse to obtain an identical UserInfo instance
  json: ->
    @_json

  # Creates a UserInfo instance from a raw API response.
  #
  # @private
  # This constructor is used by Dropbox.UserInfo.parse, and should not be
  # called directly.
  #
  # @param {Object} userInfo the result of parsing a JSON API response that
  #   describes a user
  constructor: (userInfo) ->
    @_json = userInfo
    @name = userInfo.display_name
    @email = userInfo.email
    @countryCode = userInfo.country or null
    @uid = userInfo.uid.toString()
    if userInfo.public_app_url
      @publicAppUrl = userInfo.public_app_url
      lastIndex = @publicAppUrl.length - 1
      # Strip any trailing /, to make path joining predictable.
      if lastIndex >= 0 and @publicAppUrl.substring(lastIndex) is '/'
        @publicAppUrl = @publicAppUrl.substring 0, lastIndex
    else
      @publicAppUrl = null

    @referralUrl = userInfo.referral_link
    @quota = userInfo.quota_info.quota
    @privateBytes = userInfo.quota_info.normal or 0
    @sharedBytes = userInfo.quota_info.shared or 0
    @usedQuota = @privateBytes + @sharedBytes

