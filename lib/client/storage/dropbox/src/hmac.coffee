# HMAC-SHA1 implementation heavily inspired from
#   http://pajhome.org.uk/crypt/md5/sha1.js

# Base64-encoded HMAC-SHA1.
#
# @param {String} string the ASCII string to be signed
# @param {String} key the HMAC key
# @return {String} a base64-encoded HMAC of the given string and key
base64HmacSha1 = (string, key) ->
  arrayToBase64 hmacSha1(stringToArray(string), stringToArray(key),
                         string.length, key.length)

# Base64-encoded SHA1.
#
# @param {String} string the ASCII string to be hashed
# @return {String} a base64-encoded SHA1 hash of the given string
base64Sha1 = (string) ->
  arrayToBase64 sha1(stringToArray(string), string.length)

# SHA1 and HMAC-SHA1 versions that use the node.js builtin crypto.
unless window?
  crypto = require 'crypto'
  base64HmacSha1 = (string, key) ->
    hmac = crypto.createHmac 'sha1', key
    hmac.update string
    hmac.digest 'base64'
  base64Sha1 = (string) ->
    hash = crypto.createHash 'sha1'
    hash.update string
    hash.digest 'base64'

# HMAC-SHA1 implementation.
#
# @param {Array} string the HMAC input, as an array of 32-bit numbers
# @param {Array} key the HMAC input, as an array of 32-bit numbers
# @param {Number} length the length of the HMAC input, in bytes
# @return {Array} the HMAC output, as an array of 32-bit numbers
hmacSha1 = (string, key, length, keyLength) ->
  if key.length > 16
    key = sha1 key, keyLength

  ipad = (key[i] ^ 0x36363636 for i in [0...16])
  opad = (key[i] ^ 0x5C5C5C5C for i in [0...16])

  hash1 = sha1 ipad.concat(string), 64 + length
  sha1 opad.concat(hash1), 64 + 20

# SHA1 implementation.
#
# @param {Array} string the SHA1 input, as an array of 32-bit numbers; the
#   computation trashes the array
# @param {Number} length the number of bytes in the SHA1 input; used in the
#   SHA1 padding algorithm
# @return {Array<Number>} the SHA1 output, as an array of 32-bit numbers
sha1 = (string, length) ->
  string[length >> 2] |= 1 << (31 - ((length & 0x03) << 3))
  string[(((length + 8) >> 6) << 4) + 15] = length << 3

  state = Array 80
  a = 1732584193  # 0x67452301
  b = -271733879  # 0xefcdab89
  c = -1732584194  # 0x98badcfe
  d = 271733878  # 0x10325476
  e = -1009589776  # 0xc3d2e1f0

  i = 0
  limit = string.length
  # Uncomment the line below to debug packing.
  # console.log string.map(xxx)
  while i < limit
    a0 = a
    b0 = b
    c0 = c
    d0 = d
    e0 = e

    for j in [0...80]
      if j < 16
        state[j] = string[i + j]
      else
        state[j] = rotateLeft32 state[j - 3] ^ state[j - 8] ^ state[j - 14] ^
                                state[j - 16], 1
      if j < 20
        ft = (b & c) | ((~b) & d)
        kt = 1518500249  # 0x5a827999
      else if j < 40
        ft = b ^ c ^ d
        kt = 1859775393  # 0x6ed9eba1
      else if j < 60
        ft = (b & c) | (b & d) | (c & d)
        kt = -1894007588  # 0x8f1bbcdc
      else
        ft = b ^ c ^ d
        kt = -899497514  # 0xca62c1d6
      t = add32 add32(rotateLeft32(a, 5), ft), add32(add32(e, state[j]), kt)
      e = d
      d = c
      c = rotateLeft32 b, 30
      b = a
      a = t
      # Uncomment the line below to debug block computation.
      # console.log [xxx(a), xxx(b), xxx(c), xxx(d), xxx(e)]
    a = add32 a, a0
    b = add32 b, b0
    c = add32 c, c0
    d = add32 d, d0
    e = add32 e, e0
    i += 16
  # Uncomment the line below to see the input to the base64 encoder.
  # console.log [xxx(a), xxx(b), xxx(c), xxx(d), xxx(e)]
  [a, b, c, d, e]

###
# Uncomment the definition below for debugging.
#
# Returns the hexadecimal representation of a 32-bit number.
xxx = (n) ->
  if n < 0
    n = (1 << 30) * 4 + n
  n.toString 16
###

# Rotates a 32-bit word.
#
# @param {Number} value the 32-bit number to be rotated
# @param {Number} count the number of bits (0..31) to rotate by
# @return {Number} the rotated value
rotateLeft32 = (value, count) ->
  (value << count) | (value >>> (32 - count))

# 32-bit unsigned addition.
#
# @param {Number} a, b the 32-bit numbers to be added modulo 2^32
# @return {Number} the 32-bit representation of a + b
add32 = (a, b) ->
  low = (a & 0xFFFF) + (b & 0xFFFF)
  high = (a >> 16) + (b >> 16) + (low >> 16)
  (high << 16) | (low & 0xFFFF)

# Converts a 32-bit number array into a base64-encoded string.
#
# @param {Array} an array of big-endian 32-bit numbers
# @return {String} base64 encoding of the given array of numbers
arrayToBase64 = (array) ->
  string = ""
  i = 0
  limit = array.length * 4
  while i < limit
    i2 = i
    trit = ((array[i2 >> 2] >> ((3 - (i2 & 3)) << 3)) & 0xFF) << 16
    i2 += 1
    trit |= ((array[i2 >> 2] >> ((3 - (i2 & 3)) << 3)) & 0xFF) << 8
    i2 += 1
    trit |= (array[i2 >> 2] >> ((3 - (i2 & 3)) << 3)) & 0xFF

    string += _base64Digits[(trit >> 18) & 0x3F]
    string += _base64Digits[(trit >> 12) & 0x3F]
    i += 1
    if i >= limit
      string += '='
    else
      string += _base64Digits[(trit >> 6) & 0x3F]
    i += 1
    if i >= limit
      string += '='
    else
      string += _base64Digits[trit & 0x3F]
    i += 1
  string

_base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

# Converts an ASCII string into array of 32-bit numbers.
stringToArray = (string) ->
  array = []
  mask = 0xFF
  for i in [0...string.length]
    array[i >> 2] |= (string.charCodeAt(i) & mask) << ((3 - (i & 3)) << 3)
  array

