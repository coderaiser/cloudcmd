# Main entry point to the Dropbox API.
class Dropbox
  constructor: (options) ->
    @client = new DropboxClient options

  # NOTE: this is not yet implemented.
