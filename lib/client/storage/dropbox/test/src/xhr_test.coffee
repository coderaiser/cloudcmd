describe 'Dropbox.Xhr', ->
  beforeEach ->
    @node_js = module? and module?.exports? and require?
    @oauth = new Dropbox.Oauth testKeys

  describe 'with a GET', ->
    beforeEach ->
      @xhr = new Dropbox.Xhr 'GET', 'https://request.url'

    it 'initializes correctly', ->
      expect(@xhr.isGet).to.equal true
      expect(@xhr.method).to.equal 'GET'
      expect(@xhr.url).to.equal 'https://request.url'
      expect(@xhr.preflight).to.equal false

    describe '#setHeader', ->
      beforeEach ->
        @xhr.setHeader 'Range', 'bytes=0-1000'

      it 'adds a HTTP header header', ->
        expect(@xhr.headers).to.have.property 'Range'
        expect(@xhr.headers['Range']).to.equal 'bytes=0-1000'

      it 'does not work twice for the same header', ->
        expect(=> @xhr.setHeader('Range', 'bytes=0-1000')).to.throw Error

      it 'flags the Xhr as needing preflight', ->
        expect(@xhr.preflight).to.equal true

      it 'rejects Content-Type', ->
        expect(=> @xhr.setHeader('Content-Type', 'text/plain')).to.throw Error

    describe '#setParams', ->
      beforeEach ->
        @xhr.setParams 'param 1': true, 'answer': 42

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

      it 'does not work twice', ->
        expect(=> @xhr.setParams 'answer': 43).to.throw Error

      describe '#paramsToUrl', ->
        beforeEach ->
          @xhr.paramsToUrl()

        it 'changes the url', ->
          expect(@xhr.url).to.
              equal 'https://request.url?answer=42&param%201=true'

        it 'sets params to null', ->
          expect(@xhr.params).to.equal null

      describe '#paramsToBody', ->
        it 'throws an error', ->
          expect(=> @xhr.paramsToBody()).to.throw Error

      describe '#addOauthParams', ->
        beforeEach ->
          @xhr.addOauthParams @oauth

        it 'keeps existing params', ->
          expect(@xhr.params).to.have.property 'answer'
          expect(@xhr.params.answer).to.equal 42

        it 'adds an oauth_signature param', ->
          expect(@xhr.params).to.have.property 'oauth_signature'

        it 'does not add an Authorization header', ->
          expect(@xhr.headers).not.to.have.property 'Authorization'

        it 'does not work twice', ->
          expect(=> @xhr.addOauthParams()).to.throw Error

      describe '#addOauthHeader', ->
        beforeEach ->
          @xhr.addOauthHeader @oauth

        it 'keeps existing params', ->
          expect(@xhr.params).to.have.property 'answer'
          expect(@xhr.params.answer).to.equal 42

        it 'does not add an oauth_signature param', ->
          expect(@xhr.params).not.to.have.property 'oauth_signature'

        it 'adds an Authorization header', ->
          expect(@xhr.headers).to.have.property 'Authorization'

    describe '#addOauthParams without params', ->
      beforeEach ->
        @xhr.addOauthParams @oauth

      it 'adds an oauth_signature param', ->
        expect(@xhr.params).to.have.property 'oauth_signature'

    describe '#addOauthHeader without params', ->
      beforeEach ->
        @xhr.addOauthHeader @oauth

      it 'adds an Authorization header', ->
        expect(@xhr.headers).to.have.property 'Authorization'

    describe '#signWithOauth', ->
      describe 'for a request that does not need preflight', ->
        beforeEach ->
          @xhr.signWithOauth @oauth

        if Dropbox.Xhr.doesPreflight
          it 'uses addOauthParams', ->
            expect(@xhr.params).to.have.property 'oauth_signature'
        else
          it 'uses addOauthHeader in node.js', ->
            expect(@xhr.headers).to.have.property 'Authorization'

      describe 'for a request that needs preflight', ->
        beforeEach ->
          @xhr.setHeader 'Range', 'bytes=0-1000'
          @xhr.signWithOauth @oauth

        if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do HTTP headers.
          it 'uses addOauthParams in IE', ->
            expect(@xhr.params).to.have.property 'oauth_signature'
        else
          it 'uses addOauthHeader', ->
            expect(@xhr.headers).to.have.property 'Authorization'

      describe 'with cacheFriendly: true', ->
        describe 'for a request that does not need preflight', ->
          beforeEach ->
            @xhr.signWithOauth @oauth, true

          if Dropbox.Xhr.ieXdr
            it 'uses addOauthParams in IE', ->
              expect(@xhr.params).to.have.property 'oauth_signature'
          else
            it 'uses addOauthHeader', ->
              expect(@xhr.headers).to.have.property 'Authorization'

        describe 'for a request that needs preflight', ->
          beforeEach ->
            @xhr.setHeader 'Range', 'bytes=0-1000'
            @xhr.signWithOauth @oauth, true

          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do HTTP headers.
            it 'uses addOauthParams in IE', ->
              expect(@xhr.params).to.have.property 'oauth_signature'
          else
            it 'uses addOauthHeader', ->
              expect(@xhr.headers).to.have.property 'Authorization'

    describe '#setFileField', ->
      it 'throws an error', ->
        expect(=> @xhr.setFileField('file', 'filename.bin', '<p>File Data</p>',
                                    'text/html')).to.throw Error

    describe '#setBody', ->
      it 'throws an error', ->
        expect(=> @xhr.setBody('body data')).to.throw Error

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

    describe '#setResponseType', ->
      beforeEach ->
        @xhr.setResponseType 'b'

      it 'changes responseType', ->
        expect(@xhr.responseType).to.equal 'b'

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

    describe '#prepare with params', ->
      beforeEach ->
        @xhr.setParams answer: 42
        @xhr.prepare()

      it 'creates the native xhr', ->
        expect(typeof @xhr.xhr).to.equal 'object'

      it 'opens the native xhr', ->
        return if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do readyState.
        expect(@xhr.xhr.readyState).to.equal 1

      it 'pushes the params in the url', ->
        expect(@xhr.url).to.equal 'https://request.url?answer=42'

  describe 'with a POST', ->
    beforeEach ->
      @xhr = new Dropbox.Xhr 'POST', 'https://request.url'

    it 'initializes correctly', ->
      expect(@xhr.isGet).to.equal false
      expect(@xhr.method).to.equal 'POST'
      expect(@xhr.url).to.equal 'https://request.url'
      expect(@xhr.preflight).to.equal false

    describe '#setHeader', ->
      beforeEach ->
        @xhr.setHeader 'Range', 'bytes=0-1000'

      it 'adds a HTTP header header', ->
        expect(@xhr.headers).to.have.property 'Range'
        expect(@xhr.headers['Range']).to.equal 'bytes=0-1000'

      it 'does not work twice for the same header', ->
        expect(=> @xhr.setHeader('Range', 'bytes=0-1000')).to.throw Error

      it 'flags the Xhr as needing preflight', ->
        expect(@xhr.preflight).to.equal true

      it 'rejects Content-Type', ->
        expect(=> @xhr.setHeader('Content-Type', 'text/plain')).to.throw Error

    describe '#setParams', ->
      beforeEach ->
        @xhr.setParams 'param 1': true, 'answer': 42

      it 'does not work twice', ->
        expect(=> @xhr.setParams 'answer': 43).to.throw Error

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

      describe '#paramsToUrl', ->
        beforeEach ->
          @xhr.paramsToUrl()

        it 'changes the url', ->
          expect(@xhr.url).to.
              equal 'https://request.url?answer=42&param%201=true'

        it 'sets params to null', ->
          expect(@xhr.params).to.equal null

        it 'does not set the body', ->
          expect(@xhr.body).to.equal null

      describe '#paramsToBody', ->
        beforeEach ->
          @xhr.paramsToBody()

        it 'url-encodes the params', ->
          expect(@xhr.body).to.equal 'answer=42&param%201=true'

        it 'sets the Content-Type header', ->
          expect(@xhr.headers).to.have.property 'Content-Type'
          expect(@xhr.headers['Content-Type']).to.
              equal 'application/x-www-form-urlencoded'

        it 'does not change the url', ->
          expect(@xhr.url).to.equal 'https://request.url'

        it 'does not work twice', ->
          @xhr.setParams answer: 43
          expect(=> @xhr.paramsToBody()).to.throw Error

      describe '#addOauthParams', ->
        beforeEach ->
          @xhr.addOauthParams @oauth

        it 'keeps existing params', ->
          expect(@xhr.params).to.have.property 'answer'
          expect(@xhr.params.answer).to.equal 42

        it 'adds an oauth_signature param', ->
          expect(@xhr.params).to.have.property 'oauth_signature'

        it 'does not add an Authorization header', ->
          expect(@xhr.headers).not.to.have.property 'Authorization'

        it 'does not work twice', ->
          expect(=> @xhr.addOauthParams()).to.throw Error

      describe '#addOauthHeader', ->
        beforeEach ->
          @xhr.addOauthHeader @oauth

        it 'keeps existing params', ->
          expect(@xhr.params).to.have.property 'answer'
          expect(@xhr.params.answer).to.equal 42

        it 'does not add an oauth_signature param', ->
          expect(@xhr.params).not.to.have.property 'oauth_signature'

        it 'adds an Authorization header', ->
          expect(@xhr.headers).to.have.property 'Authorization'

    describe '#addOauthParams without params', ->
      beforeEach ->
        @xhr.addOauthParams @oauth

      it 'adds an oauth_signature param', ->
        expect(@xhr.params).to.have.property 'oauth_signature'

    describe '#addOauthHeader without params', ->
      beforeEach ->
        @xhr.addOauthHeader @oauth

      it 'adds an Authorization header', ->
        expect(@xhr.headers).to.have.property 'Authorization'

    describe '#signWithOauth', ->
      describe 'for a request that does not need preflight', ->
        beforeEach ->
          @xhr.signWithOauth @oauth

        if Dropbox.Xhr.doesPreflight
          it 'uses addOauthParams', ->
            expect(@xhr.params).to.have.property 'oauth_signature'
        else
          it 'uses addOauthHeader in node.js', ->
            expect(@xhr.headers).to.have.property 'Authorization'

      describe 'for a request that needs preflight', ->
        beforeEach ->
          @xhr.setHeader 'Range', 'bytes=0-1000'
          @xhr.signWithOauth @oauth

        if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do HTTP headers.
          it 'uses addOauthParams in IE', ->
            expect(@xhr.params).to.have.property 'oauth_signature'
        else
          it 'uses addOauthHeader', ->
            expect(@xhr.headers).to.have.property 'Authorization'

      describe 'with cacheFriendly: true', ->
        describe 'for a request that does not need preflight', ->
          beforeEach ->
            @xhr.signWithOauth @oauth, true

          if Dropbox.Xhr.doesPreflight
            it 'uses addOauthParams', ->
              expect(@xhr.params).to.have.property 'oauth_signature'
          else
            it 'uses addOauthHeader in node.js', ->
              expect(@xhr.headers).to.have.property 'Authorization'

        describe 'for a request that needs preflight', ->
          beforeEach ->
            @xhr.setHeader 'Range', 'bytes=0-1000'
            @xhr.signWithOauth @oauth, true

          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do HTTP headers.
            it 'uses addOauthParams in IE', ->
              expect(@xhr.params).to.have.property 'oauth_signature'
          else
            it 'uses addOauthHeader', ->
              expect(@xhr.headers).to.have.property 'Authorization'

    describe '#setFileField with a String', ->
      beforeEach ->
        @nonceStub = sinon.stub @xhr, 'multipartBoundary'
        @nonceStub.returns 'multipart----boundary'
        @xhr.setFileField 'file', 'filename.bin', '<p>File Data</p>',
                          'text/html'

      afterEach ->
        @nonceStub.restore()

      it 'sets the Content-Type header', ->
        expect(@xhr.headers).to.have.property 'Content-Type'
        expect(@xhr.headers['Content-Type']).to.
            equal 'multipart/form-data; boundary=multipart----boundary'

      it 'sets the body', ->
        expect(@xhr.body).to.equal("""--multipart----boundary\r
Content-Disposition: form-data; name="file"; filename="filename.bin"\r
Content-Type: text/html\r
Content-Transfer-Encoding: binary\r
\r
<p>File Data</p>\r
--multipart----boundary--\r\n
""")

      it 'does not work twice', ->
        expect(=> @xhr.setFileField('file', 'filename.bin', '<p>File Data</p>',
                                    'text/html')).to.throw Error

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

    describe '#setBody with a string', ->
      beforeEach ->
        @xhr.setBody 'body data'

      it 'sets the request body', ->
        expect(@xhr.body).to.equal 'body data'

      it 'does not work twice', ->
        expect(=> @xhr.setBody('body data')).to.throw Error

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

    describe '#setBody with FormData', ->
      beforeEach ->
        if FormData?
          formData = new FormData()
          formData.append 'name', 'value'
          @xhr.setBody formData

      it 'does not flag the XHR as needing preflight', ->
        return unless FormData?
        expect(@xhr.preflight).to.equal false

    describe '#setBody with Blob', ->
      beforeEach ->
        if Blob?
          blob = new Blob ["abcdef"], type: 'image/png'
          @xhr.setBody blob

      it 'flags the XHR as needing preflight', ->
        return unless Blob?
        expect(@xhr.preflight).to.equal true

      it 'sets the Content-Type header', ->
        return unless Blob?
        expect(@xhr.headers).to.have.property 'Content-Type'
        expect(@xhr.headers['Content-Type']).to.
            equal 'application/octet-stream'

    describe '#setBody with ArrayBuffer', ->
      beforeEach ->
        if ArrayBuffer?
          buffer = new ArrayBuffer 5
          @xhr.setBody buffer

      it 'flags the XHR as needing preflight', ->
        return unless ArrayBuffer?
        expect(@xhr.preflight).to.equal true

      it 'sets the Content-Type header', ->
        return unless ArrayBuffer?
        expect(@xhr.headers).to.have.property 'Content-Type'
        expect(@xhr.headers['Content-Type']).to.
            equal 'application/octet-stream'

    describe '#setBody with ArrayBufferView', ->
      beforeEach ->
        if Uint8Array?
          view = new Uint8Array 5
          @xhr.setBody view

      it 'flags the XHR as needing preflight', ->
        return unless Uint8Array?
        expect(@xhr.preflight).to.equal true

      it 'sets the Content-Type header', ->
        return unless Uint8Array?
        expect(@xhr.headers).to.have.property 'Content-Type'
        expect(@xhr.headers['Content-Type']).to.
            equal 'application/octet-stream'

    describe '#setResponseType', ->
      beforeEach ->
        @xhr.setResponseType 'b'

      it 'changes responseType', ->
        expect(@xhr.responseType).to.equal 'b'

      it 'does not flag the XHR as needing preflight', ->
        expect(@xhr.preflight).to.equal false

    describe '#prepare with params', ->
      beforeEach ->
        @xhr.setParams answer: 42
        @xhr.prepare()

      it 'creates the native xhr', ->
        expect(typeof @xhr.xhr).to.equal 'object'

      it 'opens the native xhr', ->
        return if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do readyState.
        expect(@xhr.xhr.readyState).to.equal 1

      if Dropbox.Xhr.ieXdr
        it 'keeps the params in the URL in IE', ->
          expect(@xhr.url).to.equal 'https://request.url?answer=42'
          expect(@xhr.body).to.equal null
      else
        it 'pushes the params in the body', ->
          expect(@xhr.body).to.equal 'answer=42'

  describe 'with a PUT', ->
    beforeEach ->
      @xhr = new Dropbox.Xhr 'PUT', 'https://request.url'

    it 'initializes correctly', ->
      expect(@xhr.isGet).to.equal false
      expect(@xhr.method).to.equal 'PUT'
      expect(@xhr.url).to.equal 'https://request.url'
      expect(@xhr.preflight).to.equal true

  describe '#send', ->
    it 'reports errors correctly', (done) ->
      @url = 'https://api.dropbox.com/1/oauth/request_token'
      @xhr = new Dropbox.Xhr 'POST', @url
      @xhr.prepare().send (error, data) =>
        expect(data).to.equal undefined
        expect(error).to.be.instanceOf Dropbox.ApiError
        expect(error).to.have.property 'url'
        expect(error.url).to.equal @url
        expect(error).to.have.property 'method'
        expect(error.method).to.equal 'POST'
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do HTTP status codes.
          expect(error).to.have.property 'status'
          expect(error.status).to.equal 401  # Bad OAuth request.
        expect(error).to.have.property 'responseText'
        expect(error.responseText).to.be.a 'string'
        unless Dropbox.Xhr.ieXdr  # IE's XDR hides the HTTP body on error.
          expect(error).to.have.property 'response'
          expect(error.response).to.be.an 'object'
        expect(error.toString()).to.match /^Dropbox API error/
        expect(error.toString()).to.contain 'POST'
        expect(error.toString()).to.contain @url
        done()

    it 'reports errors correctly when onError is set', (done) ->
      @url = 'https://api.dropbox.com/1/oauth/request_token'
      @xhr = new Dropbox.Xhr 'POST', @url
      @xhr.onError = new Dropbox.EventSource
      listenerError = null
      @xhr.onError.addListener (error) -> listenerError = error
      @xhr.prepare().send (error, data) =>
        expect(data).to.equal undefined
        expect(error).to.be.instanceOf Dropbox.ApiError
        expect(error).to.have.property 'url'
        expect(error.url).to.equal @url
        expect(error).to.have.property 'method'
        expect(error.method).to.equal 'POST'
        expect(listenerError).to.equal error
        done()

    it 'processes data correctly', (done) ->
      xhr = new Dropbox.Xhr 'POST',
                            'https://api.dropbox.com/1/oauth/request_token',
      xhr.addOauthParams @oauth
      xhr.prepare().send (error, data) ->
        expect(error).to.not.be.ok
        expect(data).to.have.property 'oauth_token'
        expect(data).to.have.property 'oauth_token_secret'
        done()

    it 'processes data correctly when using setCallback', (done) ->
      xhr = new Dropbox.Xhr 'POST',
                            'https://api.dropbox.com/1/oauth/request_token',
      xhr.addOauthParams @oauth
      xhr.setCallback (error, data) ->
        expect(error).to.not.be.ok
        expect(data).to.have.property 'oauth_token'
        expect(data).to.have.property 'oauth_token_secret'
        done()
      xhr.prepare().send()

    it 'sends Authorize headers correctly', (done) ->
      return done() if Dropbox.Xhr.ieXdr  # IE's XDR doesn't set headers.

      xhr = new Dropbox.Xhr 'POST',
                            'https://api.dropbox.com/1/oauth/request_token',
      xhr.addOauthHeader @oauth
      xhr.prepare().send (error, data) ->
        expect(error).to.equal null
        expect(data).to.have.property 'oauth_token'
        expect(data).to.have.property 'oauth_token_secret'
        done()

    describe 'with a binary response', ->
      beforeEach ->
        testImageServerOn()
        @xhr = new Dropbox.Xhr 'GET', testImageUrl

      afterEach ->
        testImageServerOff()

      describe 'with responseType b', ->
        beforeEach ->
          @xhr.setResponseType 'b'

        it 'retrieves a string where each character is a byte', (done) ->
          @xhr.prepare().send (error, data) ->
            expect(error).to.not.be.ok
            expect(data).to.be.a 'string'
            expect(data).to.equal testImageBytes
            done()

      describe 'with responseType arraybuffer', ->
        beforeEach ->
          @xhr.setResponseType 'arraybuffer'

        it 'retrieves a well-formed ArrayBuffer', (done) ->
          # Skip this test on node.js and IE 9 and below
          return done() unless ArrayBuffer?

          @xhr.prepare().send (error, buffer) ->
            expect(error).to.not.be.ok
            expect(buffer).to.be.instanceOf ArrayBuffer
            view = new Uint8Array buffer
            length = buffer.byteLength
            bytes = (String.fromCharCode view[i] for i in [0...length]).
                join('')
            expect(bytes).to.equal testImageBytes
            done()

      describe 'with responseType blob', ->
        beforeEach ->
          @xhr.setResponseType 'blob'

        it 'retrieves a well-formed Blob', (done) ->
          # Skip this test on node.js and IE 9 and below
          return done() unless Blob?

          @xhr.prepare().send (error, blob) ->
            expect(error).to.not.be.ok
            expect(blob).to.be.instanceOf Blob
            reader = new FileReader
            reader.onloadend = ->
              return unless reader.readyState == FileReader.DONE
              buffer = reader.result
              view = new Uint8Array buffer
              length = buffer.byteLength
              bytes = (String.fromCharCode view[i] for i in [0...length]).
                  join('')
              expect(bytes).to.equal testImageBytes
              done()
            reader.readAsArrayBuffer blob

  describe '#urlEncode', ->
    it 'iterates properly', ->
      expect(Dropbox.Xhr.urlEncode({foo: 'bar', baz: 5})).to.
        equal 'baz=5&foo=bar'
    it 'percent-encodes properly', ->
      expect(Dropbox.Xhr.urlEncode({'a +x()': "*b'"})).to.
        equal 'a%20%2Bx%28%29=%2Ab%27'

  describe '#urlDecode', ->
    it 'iterates properly', ->
      decoded = Dropbox.Xhr.urlDecode('baz=5&foo=bar')
      expect(decoded['baz']).to.equal '5'
      expect(decoded['foo']).to.equal 'bar'
    it 'percent-decodes properly', ->
      decoded = Dropbox.Xhr.urlDecode('a%20%2Bx%28%29=%2Ab%27')
      expect(decoded['a +x()']).to.equal "*b'"

