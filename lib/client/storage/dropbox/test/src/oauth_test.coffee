describe 'Dropbox.Oauth', ->
  beforeEach ->
    @oauth = new Dropbox.Oauth
      key: 'dpf43f3p2l4k3l03',
      secret: 'kd94hf93k423kf44'
    @oauth.setToken 'nnch734d00sl2jdk', 'pfkkdhi9sl3r4s00'

    # The example in OAuth 1.0a Appendix A.
    @request =
      method: 'GET',
      url: 'http://photos.example.net/photos'
      params:
        file: 'vacation.jpg',
        size: 'original'
    @dateStub = sinon.stub Date, 'now'
    @dateStub.returns 1191242096999

  afterEach ->
    @dateStub.restore()

  describe '#boilerplateParams', ->
    it 'issues unique nonces', ->
      nonces = {}
      for i in [1..100]
        nonce = @oauth.boilerplateParams({}).oauth_nonce
        expect(nonces).not.to.have.property nonce
        nonces[nonce] = true

    it 'fills all the arguments', ->
      params = @oauth.boilerplateParams(@request.params)
      properties = ['oauth_consumer_key', 'oauth_nonce',
                    'oauth_signature_method', 'oauth_timestamp',
                    'oauth_version']
      for property in properties
        expect(params).to.have.property property

  describe '#signature', ->
    it 'works for the OAuth 1.0a example', ->
      @nonceStub = sinon.stub @oauth, 'nonce'
      @nonceStub.returns 'kllo9940pd9333jh'

      @oauth.boilerplateParams(@request.params)
      expect(@oauth.signature(@request.method, @request.url, @request.params)).
        to.equal 'tR3+Ty81lMeYAr/Fid0kMTYa/WM='

      @nonceStub.restore()

    it 'works with an encoded key', ->
      @oauth = new Dropbox.Oauth
        key: Dropbox.encodeKey(@oauth.key, @oauth.secret),
        token: @oauth.token, tokenSecret: @oauth.tokenSecret

      @nonceStub = sinon.stub @oauth, 'nonce'
      @nonceStub.returns 'kllo9940pd9333jh'

      @oauth.boilerplateParams(@request.params)
      expect(@oauth.signature(@request.method, @request.url, @request.params)).
        to.equal 'tR3+Ty81lMeYAr/Fid0kMTYa/WM='

      @nonceStub.restore()

  describe '#addAuthParams', ->
    it 'matches the OAuth 1.0a example', ->
      @nonceStub = sinon.stub @oauth, 'nonce'
      @nonceStub.returns 'kllo9940pd9333jh'

      goldenParams =
        file: 'vacation.jpg'
        oauth_consumer_key: 'dpf43f3p2l4k3l03'
        oauth_nonce: 'kllo9940pd9333jh'
        oauth_signature: 'tR3+Ty81lMeYAr/Fid0kMTYa/WM='
        oauth_signature_method: 'HMAC-SHA1'
        oauth_timestamp: '1191242096'
        oauth_token: 'nnch734d00sl2jdk'
        oauth_version: '1.0'
        size: 'original'

      @oauth.addAuthParams @request.method, @request.url, @request.params
      expect(Dropbox.Xhr.urlEncode(@request.params)).to.
          eql Dropbox.Xhr.urlEncode(goldenParams)

      @nonceStub.restore()

    it "doesn't leave any OAuth-related value in params", ->
      @oauth.authHeader(@request.method, @request.url, @request.params)
      expect(Dropbox.Xhr.urlEncode(@request.params)).to.
          equal "file=vacation.jpg&size=original"

  describe '#authHeader', ->
    it 'matches the OAuth 1.0a example', ->
      @nonceStub = sinon.stub @oauth, 'nonce'
      @nonceStub.returns 'kllo9940pd9333jh'

      goldenHeader = 'OAuth oauth_consumer_key="dpf43f3p2l4k3l03",oauth_nonce="kllo9940pd9333jh",oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1191242096",oauth_token="nnch734d00sl2jdk",oauth_version="1.0"'
      header = @oauth.authHeader @request.method, @request.url, @request.params
      expect(header).to.equal goldenHeader

      @nonceStub.restore()

    it "doesn't leave any OAuth-related value in params", ->
      @oauth.authHeader(@request.method, @request.url, @request.params)
      expect(Dropbox.Xhr.urlEncode(@request.params)).to.
          equal "file=vacation.jpg&size=original"

  describe '#appHash', ->
    it 'is a non-trivial string', ->
      expect(@oauth.appHash()).to.be.a 'string'
      expect(@oauth.appHash().length).to.be.greaterThan 4

    it 'is consistent', ->
      oauth = new Dropbox.Oauth key: @oauth.key, secret: @oauth.secret
      expect(oauth.appHash()).to.equal @oauth.appHash()

    it 'depends on the app key', ->
      oauth = new Dropbox.Oauth key: @oauth.key + '0', secret: @oauth.secret
      expect(oauth.appHash()).not.to.equal @oauth.appHash()
      expect(oauth.appHash()).to.be.a 'string'
      expect(oauth.appHash().length).to.be.greaterThan 4

  describe '#constructor', ->
    it 'raises an Error if initialized without an API key / secret', ->
      expect(-> new Dropbox.Oauth(token: '123', tokenSecret: '456')).to.
          throw(Error, /no api key/i)

