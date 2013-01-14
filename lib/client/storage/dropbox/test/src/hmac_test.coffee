describe 'Dropbox.hmac', ->
  it 'works for an empty message with an empty key', ->
    expect(Dropbox.hmac('', '')).to.equal '+9sdGxiqbAgyS31ktx+3Y3BpDh0='

  it 'works for the non-empty Wikipedia example', ->
    expect(Dropbox.hmac('The quick brown fox jumps over the lazy dog', 'key')).
      to.equal '3nybhbi3iqa8ino29wqQcBydtNk='

  it 'works for the Oauth example', ->
    key = 'kd94hf93k423kf44&pfkkdhi9sl3r4s00'
    string = 'GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26size%3Doriginal'
    expect(Dropbox.hmac(string, key)).to.equal 'tR3+Ty81lMeYAr/Fid0kMTYa/WM='

describe 'Dropbox.sha1', ->
  it 'works for an empty message', ->
    expect(Dropbox.sha1('')).to.equal '2jmj7l5rSw0yVb/vlWAYkK/YBwk='
  it 'works for the FIPS-180 Appendix A sample', ->
    expect(Dropbox.sha1('abc')).to.equal 'qZk+NkcGgWq6PiVxeFDCbJzQ2J0='
  it 'works for the FIPS-180 Appendix B sample', ->
    string = 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'
    expect(Dropbox.sha1(string)).to.equal 'hJg+RBw70m66rkqh+VEp5eVGcPE='

