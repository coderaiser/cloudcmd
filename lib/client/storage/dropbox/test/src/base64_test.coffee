describe 'Dropbox.atob', ->
  it 'decodes an ASCII string', ->
    expect(Dropbox.atob('YTFiMmMz')).to.equal 'a1b2c3'
  it 'decodes a non-ASCII character', ->
    expect(Dropbox.atob('/A==')).to.equal String.fromCharCode(252)

describe 'Dropbox.btoa', ->
  it 'encodes an ASCII string', ->
    expect(Dropbox.btoa('a1b2c3')).to.equal 'YTFiMmMz'
  it 'encodes a non-ASCII character', ->
    expect(Dropbox.btoa(String.fromCharCode(252))).to.equal '/A=='
