# Necessary bits to get a browser-side app in production.

# Packs up a key and secret into a string, to bring script kiddies some pain.
#
# @param {String} key the application's API key
# @param {String} secret the application's API secret
# @return {String} encoded key string that can be passed as the key option to
#   the Dropbox.Client constructor
dropboxEncodeKey = (key, secret) ->
  if secret
    secret = [encodeURIComponent(key), encodeURIComponent(secret)].join('?')
    key = for i in [0...(key.length / 2)]
      ((key.charCodeAt(i * 2) & 15) * 16) + (key.charCodeAt(i * 2 + 1) & 15)
  else
    [key, secret] = key.split '|', 2
    key = atob key
    key = (key.charCodeAt(i) for i in [0...key.length])
    secret = atob secret

  s = [0...256]
  y = 0
  for x in [0...256]
    y = (y + s[i] + key[x % key.length]) % 256
    [s[x], s[y]] = [s[y], s[x]]

  x = y = 0
  result = for z in [0...secret.length]
    x = (x + 1) % 256
    y = (y + s[x]) % 256
    [s[x], s[y]] = [s[y], s[x]]
    k = s[(s[x] + s[y]) % 256]
    String.fromCharCode((k ^ secret.charCodeAt(z)) % 256)

  key = (String.fromCharCode(key[i]) for i in [0...key.length])
  [btoa(key.join('')), btoa(result.join(''))].join '|'

