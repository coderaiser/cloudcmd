# All changes to the global namespace happen here.

# This file's name is set up in such a way that it will always show up last in
# the source directory. This makes coffee --join work as intended.

if module?.exports?
  # We're a node.js module, so export the Dropbox class.
  module.exports = Dropbox
else if window?
  # We're in a browser, so add Dropbox to the global namespace.
  window.Dropbox = Dropbox
else
  throw new Error('This library only supports node.js and modern browsers.')

# These are mostly useful for testing. Clients shouldn't use internal stuff.
Dropbox.atob = atob
Dropbox.btoa = btoa
Dropbox.hmac = base64HmacSha1
Dropbox.sha1 = base64Sha1
Dropbox.encodeKey = dropboxEncodeKey

