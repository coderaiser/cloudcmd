# Wraps the result of pullChanges, describing the changes in a user's Dropbox.
class Dropbox.PulledChanges
  # Creates a new Dropbox.PulledChanges instance from a /delta API call result.
  #
  # @param {?Object} deltaInfo the parsed JSON of a /delta API call result
  # @return {?Dropbox.PulledChanges} a Dropbox.PulledChanges instance wrapping
  #   the given information; if the parameter does not look like parsed JSON,
  #   it is returned as is
  @parse: (deltaInfo) ->
    if deltaInfo and typeof deltaInfo is 'object'
      new Dropbox.PulledChanges deltaInfo
    else
      deltaInfo

  # @property {Boolean} if true, the application should reset its copy of the
  #   user's Dropbox before applying the changes described by this instance
  blankSlate: undefined

  # @property {String} encodes a cursor in the list of changes to a user's
  #   Dropbox; a pullChanges call returns some changes at the cursor, and then
  #   advance the cursor to account for the returned changes; the new cursor is
  #   returned by pullChanges, and meant to be used by a subsequent pullChanges
  #   call
  cursorTag: undefined

  # @property {Array<Dropbox.PullChange> an array with one entry for each
  #   change to the user's Dropbox returned by a pullChanges call.
  changes: undefined

  # @property {Boolean} if true, the pullChanges call returned a subset of the
  #   available changes, and the application should repeat the call
  #   immediately to get more changes
  shouldPullAgain: undefined

  # @property {Boolean} if true, the API call will not have any more changes
  #   available in the nearby future, so the application should wait for at
  #   least 5 miuntes before issuing another pullChanges request
  shouldBackOff: undefined

  # Serializable representation of the pull cursor inside this object.
  #
  # @return {String} an ASCII string that can be passed to pullChanges instead
  #   of this PulledChanges instance
  cursor: -> @cursorTag

  # Creates a new Dropbox.PulledChanges instance from a /delta API call result.
  #
  # @private
  # This constructor is used by Dropbox.PulledChanges, and should not be called
  # directly.
  #
  # @param {Object} deltaInfo the parsed JSON of a /delta API call result
  constructor: (deltaInfo) ->
    @blankSlate = deltaInfo.reset or false
    @cursorTag = deltaInfo.cursor
    @shouldPullAgain = deltaInfo.has_more
    @shouldBackOff = not @shouldPullAgain
    if deltaInfo.cursor and deltaInfo.cursor.length
      @changes = (Dropbox.PullChange.parse entry for entry in deltaInfo.entries)
    else
      @changes = []

# Wraps a single change in a pullChanges result.
class Dropbox.PullChange
  # Creates a Dropbox.PullChange instance wrapping an entry in a /delta result.
  #
  # @param {?Object} entry the parsed JSON of a single entry in a /delta API
  #   call result
  # @return {?Dropbox.PullChange} a Dropbox.PullChange instance wrapping the
  #   given entry of a /delta API call; if the parameter does not look like
  #   parsed JSON, it is returned as is
  @parse: (entry) ->
    if entry and typeof entry is 'object'
      new Dropbox.PullChange entry
    else
      entry

  # @property {String} the path of the changed file or folder
  path: undefined

  # @property {Boolean} if true, this change is a deletion of the file or folder
  #   at the change's path; if a folder is deleted, all its contents (files
  #   and sub-folders) were also be deleted; pullChanges might not return
  #   separate changes expressing for the files or sub-folders
  wasRemoved: undefined

  # @property {?Dropbox.Stat} a Stat instance containing updated information for
  #   the file or folder; this is null if the change is a deletion
  stat: undefined

  # Creates a Dropbox.PullChange instance wrapping an entry in a /delta result.
  #
  # @private
  # This constructor is used by Dropbox.PullChange.parse, and should not be
  # called directly.
  #
  # @param {Object} entry the parsed JSON of a single entry in a /delta API
  #   call result
  constructor: (entry) ->
    @path = entry[0]
    @stat = Dropbox.Stat.parse entry[1]
    if @stat
      @wasRemoved = false
    else
      @stat = null
      @wasRemoved = true
