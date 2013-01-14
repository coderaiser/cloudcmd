buildClientTests = (clientKeys) ->
  # Creates the global client.
  setupClient = (test, done) ->
    # Should only be used for fixture teardown.
    test.__client = new Dropbox.Client clientKeys
    done()

  # Creates the test directory.
  setupDirectory = (test, done) ->
    # True if running on node.js
    test.node_js = module? and module?.exports? and require?

    # All test data should go here.
    test.testFolder = '/js tests.' + Math.random().toString(36)
    test.__client.mkdir test.testFolder, (error, stat) ->
      expect(error).to.equal null
      done()

  # Creates the binary image file in the test directory.
  setupImageFile = (test, done) ->
    test.imageFile = "#{test.testFolder}/test-binary-image.png"
    test.imageFileData = testImageBytes

    setupImageFileUsingArrayBuffer test, (success) ->
      if success
        return done()
      setupImageFileUsingBlob test, (success) ->
        if success
          return done()
        setupImageFileUsingString test, done

  # Standard-compliant browsers write via XHR#send(ArrayBufferView).
  setupImageFileUsingArrayBuffer = (test, done) ->
    if Uint8Array? and (not test.node_js)
      testImageServerOn()
      xhr = new Dropbox.Xhr 'GET', testImageUrl
      xhr.setResponseType('arraybuffer').prepare().send (error, buffer) =>
        testImageServerOff()
        expect(error).to.equal null
        test.__client.writeFile test.imageFile, buffer, (error, stat) ->
          expect(error).to.equal null
          # Some browsers will send the '[object Uint8Array]' string instead of
          # the ArrayBufferView.
          if stat.size is buffer.byteLength
            test.imageFileTag = stat.versionTag
            done true
          else
            done false
    else
      done false

  # Fallback to XHR#send(Blob).
  setupImageFileUsingBlob = (test, done) ->
    if Blob? and (not test.node_js)
      testImageServerOn()
      xhr = new Dropbox.Xhr 'GET', testImageUrl
      xhr.setResponseType('arraybuffer').prepare().send (error, buffer) =>
        testImageServerOff()
        expect(error).to.equal null
        blob = new Blob [buffer], type: 'image/png'
        test.__client.writeFile test.imageFile, blob, (error, stat) ->
          expect(error).to.equal null
          if stat.size is blob.size
            test.imageFileTag = stat.versionTag
            done true
          else
            done false
    else
      done false

  # Last resort: send a string that will get crushed by encoding errors.
  setupImageFileUsingString = (test, done) ->
    test.__client.writeFile(test.imageFile, test.imageFileData,
        { binary: true },
        (error, stat) ->
          expect(error).to.equal null
          test.imageFileTag = stat.versionTag
          done()
        )

  # Creates the plaintext file in the test directory.
  setupTextFile = (test, done) ->
    test.textFile = "#{test.testFolder}/test-file.txt"
    test.textFileData = "Plaintext test file #{Math.random().toString(36)}.\n"
    test.__client.writeFile(test.textFile, test.textFileData,
        (error, stat) ->
          expect(error).to.equal null
          test.textFileTag = stat.versionTag
          done()
        )

  # Global (expensive) fixtures.
  before (done) ->
    @timeout 10 * 1000
    setupClient this, =>
      setupDirectory this, =>
        setupImageFile this, =>
          setupTextFile this, ->
            done()

  # Teardown for global fixtures.
  after (done) ->
    @__client.remove @testFolder, (error, stat) =>
      @test.error(new Error(error)) if error
      done()

  # Per-test (cheap) fixtures.
  beforeEach ->
    @client = new Dropbox.Client clientKeys

  describe 'URLs for custom API server', ->
    it 'computes the other URLs correctly', ->
      client = new Dropbox.Client
        key: clientKeys.key,
        secret: clientKeys.secret,
        server: 'https://api.sandbox.dropbox-proxy.com'

      expect(client.apiServer).to.equal(
        'https://api.sandbox.dropbox-proxy.com')
      expect(client.authServer).to.equal(
        'https://www.sandbox.dropbox-proxy.com')
      expect(client.fileServer).to.equal(
        'https://api-content.sandbox.dropbox-proxy.com')

  describe '#normalizePath', ->
    it "doesn't touch relative paths", ->
      expect(@client.normalizePath('aa/b/cc/dd')).to.equal 'aa/b/cc/dd'

    it 'removes the leading / from absolute paths', ->
      expect(@client.normalizePath('/aaa/b/cc/dd')).to.equal 'aaa/b/cc/dd'

    it 'removes multiple leading /s from absolute paths', ->
      expect(@client.normalizePath('///aa/b/ccc/dd')).to.equal 'aa/b/ccc/dd'

  describe '#urlEncodePath', ->
    it 'encodes each segment separately', ->
      expect(@client.urlEncodePath('a b+c/d?e"f/g&h')).to.
          equal "a%20b%2Bc/d%3Fe%22f/g%26h"
    it 'normalizes paths', ->
      expect(@client.urlEncodePath('///a b+c/g&h')).to.
          equal "a%20b%2Bc/g%26h"

  describe '#dropboxUid', ->
    it 'matches the uid in the credentials', ->
      expect(@client.dropboxUid()).to.equal clientKeys.uid

  describe '#getUserInfo', ->
    it 'returns reasonable information', (done) ->
      @client.getUserInfo (error, userInfo, rawUserInfo) ->
        expect(error).to.equal null
        expect(userInfo).to.be.instanceOf Dropbox.UserInfo
        expect(userInfo.uid).to.equal clientKeys.uid
        expect(rawUserInfo).not.to.be.instanceOf Dropbox.UserInfo
        expect(rawUserInfo).to.have.property 'uid'
        done()

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'uses Authorization headers', (done) ->
        @client.getUserInfo httpCache: true, (error, userInfo, rawUserInfo) =>
          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
            expect(@xhr.url).to.contain 'oauth_nonce'
          else
            expect(@xhr.headers).to.have.key 'Authorization'

          expect(error).to.equal null
          expect(userInfo).to.be.instanceOf Dropbox.UserInfo
          expect(userInfo.uid).to.equal clientKeys.uid
          expect(rawUserInfo).not.to.be.instanceOf Dropbox.UserInfo
          expect(rawUserInfo).to.have.property 'uid'
          done()

  describe '#mkdir', ->
    afterEach (done) ->
      return done() unless @newFolder
      @client.remove @newFolder, (error, stat) -> done()

    it 'creates a folder in the test folder', (done) ->
      @newFolder = "#{@testFolder}/test'folder"
      @client.mkdir @newFolder, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFolder
        expect(stat.isFolder).to.equal true
        @client.stat @newFolder, (error, stat) =>
          expect(error).to.equal null
          expect(stat.isFolder).to.equal true
          done()

  describe '#readFile', ->
    it 'reads a text file', (done) ->
      @client.readFile @textFile, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.equal @textFileData
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @textFile
          expect(stat.isFile).to.equal true
        done()

    it 'reads the beginning of a text file', (done) ->
      return done() if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.

      @client.readFile @textFile, start: 0, length: 10, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.equal @textFileData.substring(0, 10)
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @textFile
        expect(stat.isFile).to.equal true
        done()

    it 'reads the middle of a text file', (done) ->
      return done() if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.

      @client.readFile @textFile, start: 8, length: 10, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.equal @textFileData.substring(8, 18)
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @textFile
        expect(stat.isFile).to.equal true
        done()

    it 'reads the end of a text file via the start: option', (done) ->
      return done() if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.

      @client.readFile @textFile, start: 10, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.equal @textFileData.substring(10)
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @textFile
        expect(stat.isFile).to.equal true
        done()

    it 'reads the end of a text file via the length: option', (done) ->
      return done() if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.

      @client.readFile @textFile, length: 10, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.
            equal @textFileData.substring(@textFileData.length - 10)
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @textFile
        expect(stat.isFile).to.equal true
        done()

    it 'reads a binary file into a string', (done) ->
      @client.readFile @imageFile, binary: true, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.equal @imageFileData
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @imageFile
          expect(stat.isFile).to.equal true
        done()

    it 'reads a binary file into a Blob', (done) ->
      return done() unless Blob?
      @client.readFile @imageFile, blob: true, (error, blob, stat) =>
        expect(error).to.equal null
        expect(blob).to.be.instanceOf Blob
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @imageFile
          expect(stat.isFile).to.equal true
        reader = new FileReader
        reader.onloadend = =>
          return unless reader.readyState == FileReader.DONE
          buffer = reader.result
          view = new Uint8Array buffer
          length = buffer.byteLength
          bytes = (String.fromCharCode view[i] for i in [0...length]).
              join('')
          expect(bytes).to.equal @imageFileData
          done()
        reader.readAsArrayBuffer blob

    it 'reads a binary file into an ArrayBuffer', (done) ->
      return done() unless ArrayBuffer?
      @client.readFile @imageFile, arrayBuffer: true, (error, buffer, stat) =>
        expect(error).to.equal null
        expect(buffer).to.be.instanceOf ArrayBuffer
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @imageFile
          expect(stat.isFile).to.equal true
        view = new Uint8Array buffer
        length = buffer.byteLength
        bytes = (String.fromCharCode view[i] for i in [0...length]).
            join('')
        expect(bytes).to.equal @imageFileData
        done()

    describe 'with an onXhr listener', ->
      beforeEach ->
        @listenerXhr = null
        @callbackCalled = false

      it 'calls the listener with a Dropbox.Xhr argument', (done) ->
        @client.onXhr.addListener (xhr) =>
          expect(xhr).to.be.instanceOf Dropbox.Xhr
          @listenerXhr = xhr
          true

        @client.readFile @textFile, (error, data, stat) =>
          expect(error).to.equal null
          expect(data).to.equal @textFileData
          done() if @listenerXhr

      it 'calls the listener before firing the XHR', (done) ->
        @client.onXhr.addListener (xhr) =>
          unless Dropbox.Xhr.ieXdr  # IE's XHR doesn't have readyState
            expect(xhr.xhr.readyState).to.equal 1
          expect(@callbackCalled).to.equal false
          @listenerXhr = xhr
          true

        @client.readFile @textFile, (error, data, stat) =>
          @callbackCalled = true
          expect(@listenerXhr).to.be.instanceOf Dropbox.Xhr
          expect(error).to.equal null
          expect(data).to.equal @textFileData
          done() if @listenerXhr

      it 'does not send the XHR if the listener cancels the event', (done) ->
        @client.onXhr.addListener (xhr) =>
          expect(@callbackCalled).to.equal false
          @listenerXhr = xhr
          # NOTE: if the client calls send(), a DOM error will fail the test
          xhr.send()
          false

        @client.readFile @textFile, (error, data, stat) =>
          @callbackCalled = true
          expect(@listenerXhr).to.be.instanceOf Dropbox.Xhr
          done() if @listenerXhr

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'reads a text file using Authorization headers', (done) ->
        @client.readFile @textFile, httpCache: true, (error, data, stat) =>
          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
            expect(@xhr.url).to.contain 'oauth_nonce'
          else
            expect(@xhr.headers).to.have.key 'Authorization'

          expect(error).to.equal null
          expect(data).to.equal @textFileData
          unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @textFile
            expect(stat.isFile).to.equal true
          done()

  describe '#writeFile', ->
    afterEach (done) ->
      return done() unless @newFile
      @client.remove @newFile, (error, stat) -> done()

    it 'writes a new text file', (done) ->
      @newFile = "#{@testFolder}/another text file.txt"
      @newFileData = "Another plaintext file #{Math.random().toString(36)}."
      @client.writeFile @newFile, @newFileData, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        expect(stat.isFile).to.equal true
        @client.readFile @newFile, (error, data, stat) =>
          expect(error).to.equal null
          expect(data).to.equal @newFileData
          unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
          done()

    it 'writes a new empty file', (done) ->
      @newFile = "#{@testFolder}/another text file.txt"
      @newFileData = ''
      @client.writeFile @newFile, @newFileData, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        expect(stat.isFile).to.equal true
        @client.readFile @newFile, (error, data, stat) =>
          expect(error).to.equal null
          expect(data).to.equal @newFileData
          unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
          done()

    it 'writes a Blob to a binary file', (done) ->
      return done() unless Blob? and ArrayBuffer?
      @newFile = "#{@testFolder}/test image from blob.png"
      newBuffer = new ArrayBuffer @imageFileData.length
      newBytes = new Uint8Array newBuffer
      for i in [0...@imageFileData.length]
        newBytes[i] = @imageFileData.charCodeAt i
      @newBlob = new Blob [newBytes], type: 'image/png'
      if @newBlob.size isnt newBuffer.byteLength
        @newBlob = new Blob [newBuffer], type: 'image/png'
      @client.writeFile @newFile, @newBlob, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        expect(stat.isFile).to.equal true

        @client.readFile @newFile, arrayBuffer: true,
            (error, buffer, stat) =>
              expect(error).to.equal null
              expect(buffer).to.be.instanceOf ArrayBuffer
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
              expect(stat.isFile).to.equal true
              view = new Uint8Array buffer
              length = buffer.byteLength
              bytes = (String.fromCharCode view[i] for i in [0...length]).
                  join('')
              expect(bytes).to.equal @imageFileData
              done()

    it 'writes a File to a binary file', (done) ->
      return done() unless File? and Blob? and ArrayBuffer?
      @newFile = "#{@testFolder}/test image from blob.png"
      newBuffer = new ArrayBuffer @imageFileData.length
      newBytes = new Uint8Array newBuffer
      for i in [0...@imageFileData.length]
        newBytes[i] = @imageFileData.charCodeAt i
      newBlob = new Blob [newBytes], type: 'image/png'

      # Called when we have a File wrapping newBlob.
      actualTestCase = (file) =>
        @newFileObject = file
        @client.writeFile @newFile, @newFileObject, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @newFile
          expect(stat.isFile).to.equal true

          @client.readFile @newFile, arrayBuffer: true,
              (error, buffer, stat) =>
                expect(error).to.equal null
                expect(buffer).to.be.instanceOf ArrayBuffer
                expect(stat).to.be.instanceOf Dropbox.Stat
                expect(stat.path).to.equal @newFile
                expect(stat.isFile).to.equal true
                view = new Uint8Array buffer
                length = buffer.byteLength
                bytes = (String.fromCharCode view[i] for i in [0...length]).
                    join('')
                expect(bytes).to.equal @imageFileData
                done()

      # TODO(pwnall): use lighter method of constructing a File, when available
      #               http://crbug.com/164933
      return done() if typeof webkitRequestFileSystem is 'undefined'
      webkitRequestFileSystem window.TEMPORARY, 1024 * 1024, (fileSystem) ->
        # NOTE: the File name is different from the uploaded file name, to
        #       catch bugs such as http://crbug.com/165095
        fileSystem.root.getFile 'test image file.png',
            create: true, exclusive: false, (fileEntry) ->
              fileEntry.createWriter (fileWriter) ->
                fileWriter.onwriteend = ->
                  fileEntry.file (file) ->
                    actualTestCase file
                fileWriter.write newBlob

    it 'writes an ArrayBuffer to a binary file', (done) ->
      return done() unless ArrayBuffer?
      @newFile = "#{@testFolder}/test image from arraybuffer.png"
      @newBuffer = new ArrayBuffer @imageFileData.length
      newBytes = new Uint8Array @newBuffer
      for i in [0...@imageFileData.length]
        newBytes[i] = @imageFileData.charCodeAt i
      @client.writeFile @newFile, @newBuffer, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        expect(stat.isFile).to.equal true

        @client.readFile @newFile, arrayBuffer: true,
            (error, buffer, stat) =>
              expect(error).to.equal null
              expect(buffer).to.be.instanceOf ArrayBuffer
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
              expect(stat.isFile).to.equal true
              view = new Uint8Array buffer
              length = buffer.byteLength
              bytes = (String.fromCharCode view[i] for i in [0...length]).
                  join('')
              expect(bytes).to.equal @imageFileData
              done()

    it 'writes an ArrayBufferView to a binary file', (done) ->
      return done() unless ArrayBuffer?
      @newFile = "#{@testFolder}/test image from arraybufferview.png"
      @newBytes = new Uint8Array @imageFileData.length
      for i in [0...@imageFileData.length]
        @newBytes[i] = @imageFileData.charCodeAt i
      @client.writeFile @newFile, @newBytes, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        expect(stat.isFile).to.equal true

        @client.readFile @newFile, arrayBuffer: true,
            (error, buffer, stat) =>
              expect(error).to.equal null
              expect(buffer).to.be.instanceOf ArrayBuffer
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
              expect(stat.isFile).to.equal true
              view = new Uint8Array buffer
              length = buffer.byteLength
              bytes = (String.fromCharCode view[i] for i in [0...length]).
                  join('')
              expect(bytes).to.equal @imageFileData
              done()

  describe '#resumableUploadStep + #resumableUploadFinish', ->
    beforeEach ->
      if ArrayBuffer?  # IE9 and below doesn't have ArrayBuffer
        @length1 = Math.ceil @imageFileData.length / 3
        @length2 = @imageFileData.length - @length1
        @buffer1 = new ArrayBuffer @length1

        @view1 = new Uint8Array @buffer1
        for i in [0...@length1]
          @view1[i] = @imageFileData.charCodeAt i
        @buffer2 = new ArrayBuffer @length2
        @view2 = new Uint8Array @buffer2
        for i in [0...@length2]
          @view2[i] = @imageFileData.charCodeAt @length1 + i

        if Blob?  # node.js and IE9 and below don't have Blob
          @blob1 = new Blob [@view1], type: 'image/png'
          if @blob1.size isnt @buffer1.byteLength
            @blob1 = new Blob [@buffer1], type: 'image/png'
          @blob2 = new Blob [@view2], type: 'image/png'
          if @blob2.size isnt @buffer2.byteLength
            @blob2 = new Blob [@buffer2], type: 'image/png'

    afterEach (done) ->
      @timeout 20 * 1000  # This sequence is slow on the current API server.
      return done() unless @newFile
      @client.remove @newFile, (error, stat) -> done()

    it 'writes a text file in two stages', (done) ->
      @timeout 20 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/test resumable upload.txt"
      line1 = "This is the first fragment\n"
      line2 = "This is the second fragment\n"
      @client.resumableUploadStep line1, null, (error, cursor1) =>
        expect(error).to.equal null
        expect(cursor1).to.be.instanceOf Dropbox.UploadCursor
        expect(cursor1.offset).to.equal line1.length
        @client.resumableUploadStep line2, cursor1, (error, cursor2) =>
          expect(error).to.equal null
          expect(cursor2).to.be.instanceOf Dropbox.UploadCursor
          expect(cursor2.offset).to.equal line1.length + line2.length
          expect(cursor2.tag).to.equal cursor1.tag
          @client.resumableUploadFinish @newFile, cursor2, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
            @client.readFile @newFile, (error, data, stat) =>
              expect(error).to.equal null
              expect(data).to.equal line1 + line2
              unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
                expect(stat).to.be.instanceOf Dropbox.Stat
                expect(stat.path).to.equal @newFile
                expect(stat.isFile).to.equal true
              done()

    it 'writes a binary file using two ArrayBuffers', (done) ->
      return done() unless @buffer1
      @timeout 20 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/test resumable arraybuffer upload.png"
      @client.resumableUploadStep @buffer1, null, (error, cursor1) =>
        expect(error).to.equal null
        expect(cursor1).to.be.instanceOf Dropbox.UploadCursor
        expect(cursor1.offset).to.equal @length1
        @client.resumableUploadStep @buffer2, cursor1, (error, cursor2) =>
          expect(error).to.equal null
          expect(cursor2).to.be.instanceOf Dropbox.UploadCursor
          expect(cursor2.offset).to.equal @length1 + @length2
          expect(cursor2.tag).to.equal cursor1.tag
          @client.resumableUploadFinish @newFile, cursor2, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
            @client.readFile @newFile, arrayBuffer: true,
                (error, buffer, stat) =>
                  expect(error).to.equal null
                  expect(buffer).to.be.instanceOf ArrayBuffer
                  expect(stat).to.be.instanceOf Dropbox.Stat
                  expect(stat.path).to.equal @newFile
                  expect(stat.isFile).to.equal true
                  view = new Uint8Array buffer
                  length = buffer.byteLength
                  bytes = (String.fromCharCode view[i] for i in [0...length]).
                      join('')
                  expect(bytes).to.equal @imageFileData
                  done()

    it 'writes a binary file using two ArrayBufferViews', (done) ->
      return done() unless @view1
      @timeout 20 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/test resumable arraybuffer upload.png"
      @client.resumableUploadStep @buffer1, null, (error, cursor1) =>
        expect(error).to.equal null
        expect(cursor1).to.be.instanceOf Dropbox.UploadCursor
        expect(cursor1.offset).to.equal @length1
        @client.resumableUploadStep @buffer2, cursor1, (error, cursor2) =>
          expect(error).to.equal null
          expect(cursor2).to.be.instanceOf Dropbox.UploadCursor
          expect(cursor2.offset).to.equal @length1 + @length2
          expect(cursor2.tag).to.equal cursor1.tag
          @client.resumableUploadFinish @newFile, cursor2, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
            @client.readFile @newFile, arrayBuffer: true,
                (error, buffer, stat) =>
                  expect(error).to.equal null
                  expect(buffer).to.be.instanceOf ArrayBuffer
                  expect(stat).to.be.instanceOf Dropbox.Stat
                  expect(stat.path).to.equal @newFile
                  expect(stat.isFile).to.equal true
                  view = new Uint8Array buffer
                  length = buffer.byteLength
                  bytes = (String.fromCharCode view[i] for i in [0...length]).
                      join('')
                  expect(bytes).to.equal @imageFileData
                  done()


    it 'writes a binary file using two Blobs', (done) ->
      return done() unless @blob1
      @timeout 20 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/test resumable blob upload.png"
      @client.resumableUploadStep @blob1, null, (error, cursor1) =>
        expect(error).to.equal null
        expect(cursor1).to.be.instanceOf Dropbox.UploadCursor
        expect(cursor1.offset).to.equal @length1
        @client.resumableUploadStep @blob2, cursor1, (error, cursor2) =>
          expect(error).to.equal null
          expect(cursor2).to.be.instanceOf Dropbox.UploadCursor
          expect(cursor2.offset).to.equal @length1 + @length2
          expect(cursor2.tag).to.equal cursor1.tag
          @client.resumableUploadFinish @newFile, cursor2, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            expect(stat.isFile).to.equal true
            @client.readFile @newFile, arrayBuffer: true,
                (error, buffer, stat) =>
                  expect(error).to.equal null
                  expect(buffer).to.be.instanceOf ArrayBuffer
                  expect(stat).to.be.instanceOf Dropbox.Stat
                  expect(stat.path).to.equal @newFile
                  expect(stat.isFile).to.equal true
                  view = new Uint8Array buffer
                  length = buffer.byteLength
                  bytes = (String.fromCharCode view[i] for i in [0...length]).
                      join('')
                  expect(bytes).to.equal @imageFileData
                  done()

    it 'recovers from out-of-sync correctly', (done) ->
      # IE's XDR doesn't return anything on errors, so we can't do recovery.
      return done() if Dropbox.Xhr.ieXdr
      @timeout 20 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/test resumable upload out of sync.txt"
      line1 = "This is the first fragment\n"
      line2 = "This is the second fragment\n"
      @client.resumableUploadStep line1, null, (error, cursor1) =>
        expect(error).to.equal null
        expect(cursor1).to.be.instanceOf Dropbox.UploadCursor
        expect(cursor1.offset).to.equal line1.length
        cursor1.offset += 10
        @client.resumableUploadStep line2, cursor1, (error, cursor2) =>
          expect(error).to.equal null
          expect(cursor2).to.be.instanceOf Dropbox.UploadCursor
          expect(cursor2.offset).to.equal line1.length
          expect(cursor2.tag).to.equal cursor1.tag
          @client.resumableUploadStep line2, cursor2, (error, cursor3) =>
            expect(error).to.equal null
            expect(cursor3).to.be.instanceOf Dropbox.UploadCursor
            expect(cursor3.offset).to.equal line1.length + line2.length
            expect(cursor3.tag).to.equal cursor1.tag
            @client.resumableUploadFinish @newFile, cursor3, (error, stat) =>
              expect(error).to.equal null
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
              expect(stat.isFile).to.equal true
              @client.readFile @newFile, (error, data, stat) =>
                expect(error).to.equal null
                expect(data).to.equal line1 + line2
                unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
                  expect(stat).to.be.instanceOf Dropbox.Stat
                  expect(stat.path).to.equal @newFile
                  expect(stat.isFile).to.equal true
                done()

    it 'reports errors correctly', (done) ->
      @newFile = "#{@testFolder}/test resumable upload error.txt"
      badCursor = new Dropbox.UploadCursor 'trollcursor'
      badCursor.offset = 42
      @client.resumableUploadStep @textFileData, badCursor, (error, cursor) =>
        expect(cursor).to.equal undefined
        expect(error).to.be.instanceOf Dropbox.ApiError
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do status codes.
          expect(error.status).to.equal 404
        done()

  describe '#stat', ->
    it 'retrieves a Stat for a file', (done) ->
      @client.stat @textFile, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @textFile
        expect(stat.isFile).to.equal true
        expect(stat.versionTag).to.equal @textFileTag
        expect(stat.size).to.equal @textFileData.length
        if clientKeys.sandbox
          expect(stat.inAppFolder).to.equal true
        else
          expect(stat.inAppFolder).to.equal false
        done()

    it 'retrieves a Stat for a folder', (done) ->
      @client.stat @testFolder, (error, stat, entries) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @testFolder
        expect(stat.isFolder).to.equal true
        expect(stat.size).to.equal 0
        if clientKeys.sandbox
          expect(stat.inAppFolder).to.equal true
        else
          expect(stat.inAppFolder).to.equal false
        expect(entries).to.equal undefined
        done()

    it 'retrieves a Stat and entries for a folder', (done) ->
      @client.stat @testFolder, { readDir: true }, (error, stat, entries) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @testFolder
        expect(stat.isFolder).to.equal true
        expect(entries).to.be.ok
        expect(entries).to.have.length 2
        expect(entries[0]).to.be.instanceOf Dropbox.Stat
        expect(entries[0].path).not.to.equal @testFolder
        expect(entries[0].path).to.have.string @testFolder
        done()

    it 'fails cleanly for a non-existing path', (done) ->
      listenerError = null
      @client.onError.addListener (error) -> listenerError = error

      @client.stat @testFolder + '/should_404.txt', (error, stat, entries) =>
        expect(stat).to.equal undefined
        expect(entries).to.equal.null
        expect(error).to.be.instanceOf Dropbox.ApiError
        expect(listenerError).to.equal error
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do status codes.
          expect(error).to.have.property 'status'
          expect(error.status).to.equal 404
        done()

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'retrieves a Stat for a file using Authorization headers', (done) ->
        @client.stat @textFile, httpCache: true, (error, stat) =>
          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
            expect(@xhr.url).to.contain 'oauth_nonce'
          else
            expect(@xhr.headers).to.have.key 'Authorization'

          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @textFile
          expect(stat.isFile).to.equal true
          expect(stat.versionTag).to.equal @textFileTag
          expect(stat.size).to.equal @textFileData.length
          if clientKeys.sandbox
            expect(stat.inAppFolder).to.equal true
          else
            expect(stat.inAppFolder).to.equal false
          done()

  describe '#readdir', ->
    it 'retrieves a Stat and entries for a folder', (done) ->
      @client.readdir @testFolder, (error, entries, dir_stat, entry_stats) =>
        expect(error).to.equal null
        expect(entries).to.be.ok
        expect(entries).to.have.length 2
        expect(entries[0]).to.be.a 'string'
        expect(entries[0]).not.to.have.string '/'
        expect(entries[0]).to.match /^(test-binary-image.png)|(test-file.txt)$/
        expect(dir_stat).to.be.instanceOf Dropbox.Stat
        expect(dir_stat.path).to.equal @testFolder
        expect(dir_stat.isFolder).to.equal true
        expect(entry_stats).to.be.ok
        expect(entry_stats).to.have.length 2
        expect(entry_stats[0]).to.be.instanceOf Dropbox.Stat
        expect(entry_stats[0].path).not.to.equal @testFolder
        expect(entry_stats[0].path).to.have.string @testFolder
        done()

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'retrieves a folder Stat and entries using Authorization', (done) ->
        @client.readdir @testFolder, httpCache: true,
            (error, entries, dir_stat, entry_stats) =>
              if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
                expect(@xhr.url).to.contain 'oauth_nonce'
              else
                expect(@xhr.headers).to.have.key 'Authorization'

              expect(error).to.equal null
              expect(entries).to.be.ok
              expect(entries).to.have.length 2
              expect(entries[0]).to.be.a 'string'
              expect(entries[0]).not.to.have.string '/'
              expect(entries[0]).to.match(
                  /^(test-binary-image.png)|(test-file.txt)$/)
              expect(dir_stat).to.be.instanceOf Dropbox.Stat
              expect(dir_stat.path).to.equal @testFolder
              expect(dir_stat.isFolder).to.equal true
              expect(entry_stats).to.be.ok
              expect(entry_stats).to.have.length 2
              expect(entry_stats[0]).to.be.instanceOf Dropbox.Stat
              expect(entry_stats[0].path).not.to.equal @testFolder
              expect(entry_stats[0].path).to.have.string @testFolder
              done()

  describe '#history', ->
    it 'gets a list of revisions', (done) ->
      @client.history @textFile, (error, versions) =>
        expect(error).to.equal null
        expect(versions).to.have.length 1
        expect(versions[0]).to.be.instanceOf Dropbox.Stat
        expect(versions[0].path).to.equal @textFile
        expect(versions[0].size).to.equal @textFileData.length
        expect(versions[0].versionTag).to.equal @textFileTag
        done()

    it 'returns 40x if the limit is set to 0', (done) ->
      listenerError = null
      @client.onError.addListener (error) -> listenerError = error

      @client.history @textFile, limit: 0, (error, versions) =>
        expect(error).to.be.instanceOf Dropbox.ApiError
        expect(listenerError).to.equal error
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do status codes.
          expect(error.status).to.be.within 400, 499
        expect(versions).not.to.be.ok
        done()

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'gets a list of revisions using Authorization headers', (done) ->
        @client.history @textFile, httpCache: true, (error, versions) =>
          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
            expect(@xhr.url).to.contain 'oauth_nonce'
          else
            expect(@xhr.headers).to.have.key 'Authorization'

          expect(error).to.equal null
          expect(versions).to.have.length 1
          expect(versions[0]).to.be.instanceOf Dropbox.Stat
          expect(versions[0].path).to.equal @textFile
          expect(versions[0].size).to.equal @textFileData.length
          expect(versions[0].versionTag).to.equal @textFileTag
          done()

  describe '#copy', ->
    afterEach (done) ->
      return done() unless @newFile
      @client.remove @newFile, (error, stat) -> done()

    it 'copies a file given by path', (done) ->
      @timeout 12 * 1000  # This sequence is slow on the current API server.

      @newFile = "#{@testFolder}/copy of test-file.txt"
      @client.copy @textFile, @newFile, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFile
        @client.readFile @newFile, (error, data, stat) =>
          expect(error).to.equal null
          expect(data).to.equal @textFileData
          unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
          @client.readFile @textFile, (error, data, stat) =>
            expect(error).to.equal null
            expect(data).to.equal @textFileData
            unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @textFile
              expect(stat.versionTag).to.equal @textFileTag
            done()

  describe '#makeCopyReference', ->
    afterEach (done) ->
      return done() unless @newFile
      @client.remove @newFile, (error, stat) -> done()

    it 'creates a Dropbox.CopyReference that copies the file', (done) ->
      @timeout 12 * 1000  # This sequence is slow on the current API server.
      @newFile = "#{@testFolder}/ref copy of test-file.txt"

      @client.makeCopyReference @textFile, (error, copyRef) =>
        expect(error).to.equal null
        expect(copyRef).to.be.instanceOf Dropbox.CopyReference
        @client.copy copyRef, @newFile, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @newFile
          expect(stat.isFile).to.equal true
          @client.readFile @newFile, (error, data, stat) =>
            expect(error).to.equal null
            expect(data).to.equal @textFileData
            unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
            done()

  describe '#move', ->
    beforeEach (done) ->
      @timeout 10 * 1000  # This sequence is slow on the current API server.
      @moveFrom = "#{@testFolder}/move source of test-file.txt"
      @client.copy @textFile, @moveFrom, (error, stat) ->
        expect(error).to.equal null
        done()

    afterEach (done) ->
      @client.remove @moveFrom, (error, stat) =>
        return done() unless @moveTo
        @client.remove @moveTo, (error, stat) -> done()

    it 'moves a file', (done) ->
      @timeout 15 * 1000  # This sequence is slow on the current API server.
      @moveTo = "#{@testFolder}/moved test-file.txt"
      @client.move @moveFrom, @moveTo, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @moveTo
        expect(stat.isFile).to.equal true
        @client.readFile @moveTo, (error, data, stat) =>
          expect(error).to.equal null
          expect(data).to.equal @textFileData
          unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @moveTo
          @client.readFile @moveFrom, (error, data, stat) ->
            expect(error).to.be.ok
            unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do status codes.
              expect(error).to.have.property 'status'
              expect(error.status).to.equal 404
            expect(data).to.equal undefined
            unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
              expect(stat).to.equal undefined
            done()

  describe '#remove', ->
    beforeEach (done) ->
      @newFolder = "#{@testFolder}/folder delete test"
      @client.mkdir @newFolder, (error, stat) =>
        expect(error).to.equal null
        done()

    afterEach (done) ->
      return done() unless @newFolder
      @client.remove @newFolder, (error, stat) -> done()

    it 'deletes a folder', (done) ->
      @client.remove @newFolder, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFolder
        @client.stat @newFolder, { removed: true }, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.isRemoved).to.equal true
          done()

    it 'deletes a folder when called as unlink', (done) ->
      @client.unlink @newFolder, (error, stat) =>
        expect(error).to.equal null
        expect(stat).to.be.instanceOf Dropbox.Stat
        expect(stat.path).to.equal @newFolder
        @client.stat @newFolder, { removed: true }, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.isRemoved).to.equal true
          done()

  describe '#revertFile', ->
    describe 'on a removed file', ->
      beforeEach (done) ->
        @timeout 12 * 1000  # This sequence seems to be quite slow.

        @newFile = "#{@testFolder}/file revert test.txt"
        @client.copy @textFile, @newFile, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @newFile
          @versionTag = stat.versionTag
          @client.remove @newFile, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.be.instanceOf Dropbox.Stat
            expect(stat.path).to.equal @newFile
            done()

      afterEach (done) ->
        return done() unless @newFile
        @client.remove @newFile, (error, stat) -> done()

      it 'reverts the file to a previous version', (done) ->
        @timeout 12 * 1000  # This sequence seems to be quite slow.

        @client.revertFile @newFile, @versionTag, (error, stat) =>
          expect(error).to.equal null
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @newFile
          expect(stat.isRemoved).to.equal false
          @client.readFile @newFile, (error, data, stat) =>
            expect(error).to.equal null
            expect(data).to.equal @textFileData
            unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
              expect(stat).to.be.instanceOf Dropbox.Stat
              expect(stat.path).to.equal @newFile
              expect(stat.isRemoved).to.equal false
            done()

  describe '#findByName', ->
    it 'locates the test folder given a partial name', (done) ->
      namePattern = @testFolder.substring 5
      @client.search '/', namePattern, (error, matches) =>
        expect(error).to.equal null
        expect(matches).to.have.length 1
        expect(matches[0]).to.be.instanceOf Dropbox.Stat
        expect(matches[0].path).to.equal @testFolder
        expect(matches[0].isFolder).to.equal true
        done()

    it 'lists the test folder files given the "test" pattern', (done) ->
      @client.search @testFolder, 'test', (error, matches) =>
        expect(error).to.equal null
        expect(matches).to.have.length 2
        done()

    it 'only lists one match when given limit 1', (done) ->
      @client.search @testFolder, 'test', limit: 1, (error, matches) =>
        expect(error).to.equal null
        expect(matches).to.have.length 1
        done()

    describe 'with httpCache', ->
      beforeEach ->
        @xhr = null
        @client.onXhr.addListener (xhr) =>
          @xhr = xhr

      it 'locates the test folder using Authorize headers', (done) ->
        namePattern = @testFolder.substring 5
        @client.search '/', namePattern, httpCache: true, (error, matches) =>
          if Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers
            expect(@xhr.url).to.contain 'oauth_nonce'
          else
            expect(@xhr.headers).to.have.key 'Authorization'

          expect(error).to.equal null
          expect(matches).to.have.length 1
          expect(matches[0]).to.be.instanceOf Dropbox.Stat
          expect(matches[0].path).to.equal @testFolder
          expect(matches[0].isFolder).to.equal true
          done()

  describe '#makeUrl', ->
    describe 'for a short Web URL', ->
      it 'returns a shortened Dropbox URL', (done) ->
        @client.makeUrl @textFile, (error, publicUrl) ->
          expect(error).to.equal null
          expect(publicUrl).to.be.instanceOf Dropbox.PublicUrl
          expect(publicUrl.isDirect).to.equal false
          expect(publicUrl.url).to.contain '//db.tt/'
          done()

    describe 'for a Web URL created with long: true', ->
      it 'returns an URL to a preview page', (done) ->
        @client.makeUrl @textFile, { long: true }, (error, publicUrl) =>
          expect(error).to.equal null
          expect(publicUrl).to.be.instanceOf Dropbox.PublicUrl
          expect(publicUrl.isDirect).to.equal false
          expect(publicUrl.url).not.to.contain '//db.tt/'

          # The cont/ents server does not return CORS headers.
          return done() unless @nodejs
          Dropbox.Xhr.request 'GET', publicUrl.url, {}, null, (error, data) ->
            expect(error).to.equal null
            expect(data).to.contain '<!DOCTYPE html>'
            done()

    describe 'for a Web URL created with longUrl: true', ->
      it 'returns an URL to a preview page', (done) ->
        @client.makeUrl @textFile, { longUrl: true }, (error, publicUrl) =>
          expect(error).to.equal null
          expect(publicUrl).to.be.instanceOf Dropbox.PublicUrl
          expect(publicUrl.isDirect).to.equal false
          expect(publicUrl.url).not.to.contain '//db.tt/'
          done()

    describe 'for a direct download URL', ->
      it 'gets a direct download URL', (done) ->
        @client.makeUrl @textFile, { download: true }, (error, publicUrl) =>
          expect(error).to.equal null
          expect(publicUrl).to.be.instanceOf Dropbox.PublicUrl
          expect(publicUrl.isDirect).to.equal true
          expect(publicUrl.url).not.to.contain '//db.tt/'

          # The contents server does not return CORS headers.
          return done() unless @nodejs
          Dropbox.Xhr.request 'GET', publicUrl.url, {}, null, (error, data) =>
            expect(error).to.equal null
            expect(data).to.equal @textFileData
            done()

    describe 'for a direct download URL created with downloadHack: true', ->
      it 'gets a direct long-lived download URL', (done) ->
        @client.makeUrl @textFile, { downloadHack: true }, (error, publicUrl) =>
          expect(error).to.equal null
          expect(publicUrl).to.be.instanceOf Dropbox.PublicUrl
          expect(publicUrl.isDirect).to.equal true
          expect(publicUrl.url).not.to.contain '//db.tt/'
          expect(publicUrl.expiresAt - Date.now()).to.be.above 86400000

          # The download server does not return CORS headers.
          return done() unless @nodejs
          Dropbox.Xhr.request 'GET', publicUrl.url, {}, null, (error, data) =>
            expect(error).to.equal null
            expect(data).to.equal @textFileData
            done()

  describe '#pullChanges', ->
    beforeEach ->
      # Pulling an entire Dropbox can take a lot of time, so we need fancy
      # logic here.
      @timeoutValue = 60 * 1000
      @timeout @timeoutValue

    afterEach (done) ->
      @timeoutValue += 10 * 1000
      @timeout @timeoutValue
      return done() unless @newFile
      @client.remove @newFile, (error, stat) -> done()

    it 'gets a cursor, then it gets relevant changes', (done) ->
      @timeout @timeoutValue

      @client.pullChanges (error, changes) =>
        expect(error).to.equal null
        expect(changes).to.be.instanceOf Dropbox.PulledChanges
        expect(changes.blankSlate).to.equal true

        # Calls pullChanges until it's done listing the user's Dropbox.
        drainEntries = (client, callback) =>
          return callback() unless changes.shouldPullAgain
          @timeoutValue += 10 * 1000  # 10 extra seconds per call
          @timeout @timeoutValue
          client.pullChanges changes, (error, _changes) ->
            expect(error).to.equal null
            changes = _changes
            drainEntries client, callback
        drainEntries @client, =>

          @newFile = "#{@testFolder}/delta-test.txt"
          newFileData = "This file is used to test the pullChanges method.\n"
          @client.writeFile @newFile, newFileData, (error, stat) =>
            expect(error).to.equal null
            expect(stat).to.have.property 'path'
            expect(stat.path).to.equal @newFile

            @client.pullChanges changes, (error, changes) =>
              expect(error).to.equal null
              expect(changes).to.be.instanceof Dropbox.PulledChanges
              expect(changes.blankSlate).to.equal false
              expect(changes.changes).to.have.length.greaterThan 0
              change = changes.changes[changes.changes.length - 1]
              expect(change).to.be.instanceOf Dropbox.PullChange
              expect(change.path).to.equal @newFile
              expect(change.wasRemoved).to.equal false
              expect(change.stat.path).to.equal @newFile
              done()

  describe '#thumbnailUrl', ->
    it 'produces an URL that contains the file name', ->
      url = @client.thumbnailUrl @imageFile, { png: true, size: 'medium' }
      expect(url).to.contain 'tests'  # Fragment of the file name.
      expect(url).to.contain 'png'
      expect(url).to.contain 'medium'

  describe '#readThumbnail', ->
    it 'reads the image into a string', (done) ->
      @timeout 12 * 1000  # Thumbnail generation is slow.
      @client.readThumbnail @imageFile, { png: true }, (error, data, stat) =>
        expect(error).to.equal null
        expect(data).to.be.a 'string'
        expect(data).to.contain 'PNG'
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @imageFile
          expect(stat.isFile).to.equal true
        done()

    it 'reads the image into a Blob', (done) ->
      return done() unless Blob?
      @timeout 12 * 1000  # Thumbnail generation is slow.
      options = { png: true, blob: true }
      @client.readThumbnail @imageFile, options, (error, blob, stat) =>
        expect(error).to.equal null
        expect(blob).to.be.instanceOf Blob
        unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do headers.
          expect(stat).to.be.instanceOf Dropbox.Stat
          expect(stat.path).to.equal @imageFile
          expect(stat.isFile).to.equal true
        reader = new FileReader
        reader.onloadend = =>
          return unless reader.readyState == FileReader.DONE
          buffer = reader.result
          view = new Uint8Array buffer
          length = buffer.byteLength
          bytes = (String.fromCharCode view[i] for i in [0...length]).
              join('')
          expect(bytes).to.contain 'PNG'
          done()
        reader.readAsArrayBuffer blob

  describe '#reset', ->
    beforeEach ->
      @authStates = []
      @client.onAuthStateChange.addListener (client) =>
        @authStates.push client.authState
      @client.reset()

    it 'gets the client into the RESET state', ->
      expect(@client.authState).to.equal Dropbox.Client.RESET

    it 'removes token and uid information', ->
      credentials = @client.credentials()
      expect(credentials).not.to.have.property 'token'
      expect(credentials).not.to.have.property 'tokenSecret'
      expect(credentials).not.to.have.property 'uid'

    it 'triggers onAuthStateChange', ->
      expect(@authStates).to.deep.equal [Dropbox.Client.RESET]

    it 'does not trigger onAuthState if already reset', ->
      @authStates = []
      @client.reset()
      expect(@authStates).to.deep.equal []

  describe '#credentials', ->
    it 'contains all the expected keys when DONE', ->
      credentials = @client.credentials()
      expect(credentials).to.have.property 'key'
      expect(credentials).to.have.property 'sandbox'
      expect(credentials).to.have.property 'token'
      expect(credentials).to.have.property 'tokenSecret'
      expect(credentials).to.have.property 'uid'

    it 'does not return an authState when DONE', ->
      credentials = @client.credentials()
      expect(credentials).not.to.have.property 'authState'
      expect(credentials).not.to.have.property 'secret'

    it 'contains all the expected keys when RESET', ->
      @client.reset()
      credentials = @client.credentials()
      expect(credentials).to.have.property 'key'
      expect(credentials).to.have.property 'sandbox'

    it 'does not return an authState when RESET', ->
      @client.reset()
      credentials = @client.credentials()
      expect(credentials).not.to.have.property 'authState'
      expect(credentials).not.to.have.property 'secret'

    describe 'for a client with raw keys', ->
      beforeEach ->
        @client.setCredentials(
          key: 'dpf43f3p2l4k3l03', secret: 'kd94hf93k423kf44',
          token: 'user-token', tokenSecret: 'user-secret', uid: '1234567')

      it 'contains all the expected keys when DONE', ->
        credentials = @client.credentials()
        expect(credentials).to.have.property 'key'
        expect(credentials).to.have.property 'secret'
        expect(credentials).to.have.property 'token'
        expect(credentials).to.have.property 'tokenSecret'
        expect(credentials).to.have.property 'uid'

      it 'contains all the expected keys when RESET', ->
        @client.reset()
        credentials = @client.credentials()
        expect(credentials).to.have.property 'key'
        expect(credentials).to.have.property 'sandbox'
        expect(credentials).to.have.property 'secret'


  describe '#setCredentials', ->
    it 'gets the client into the RESET state', ->
      @client.setCredentials key: 'app-key', secret: 'app-secret'
      expect(@client.authState).to.equal Dropbox.Client.RESET
      credentials = @client.credentials()
      expect(credentials.key).to.equal 'app-key'
      expect(credentials.secret).to.equal 'app-secret'

    it 'gets the client into the REQUEST state', ->
      @client.setCredentials(
          key: 'app-key', secret: 'app-secret', token: 'user-token',
          tokenSecret: 'user-secret', authState: Dropbox.Client.REQUEST)
      expect(@client.authState).to.equal Dropbox.Client.REQUEST
      credentials = @client.credentials()
      expect(credentials.key).to.equal 'app-key'
      expect(credentials.secret).to.equal 'app-secret'
      expect(credentials.token).to.equal 'user-token'
      expect(credentials.tokenSecret).to.equal 'user-secret'

    it 'gets the client into the DONE state', ->
      @client.setCredentials(
          key: 'app-key', secret: 'app-secret', token: 'user-token',
          tokenSecret: 'user-secret', uid: '3141592')
      expect(@client.authState).to.equal Dropbox.Client.DONE
      credentials = @client.credentials()
      expect(credentials.key).to.equal 'app-key'
      expect(credentials.secret).to.equal 'app-secret'
      expect(credentials.token).to.equal 'user-token'
      expect(credentials.tokenSecret).to.equal 'user-secret'
      expect(credentials.uid).to.equal '3141592'

    beforeEach ->
      @authStates = []
      @client.onAuthStateChange.addListener (client) =>
        @authStates.push client.authState

    it 'triggers onAuthStateChange when switching from DONE to RESET', ->
      @client.setCredentials key: 'app-key', secret: 'app-secret'
      expect(@authStates).to.deep.equal [Dropbox.Client.RESET]

    it 'does not trigger onAuthStateChange when not switching', ->
      @client.setCredentials key: 'app-key', secret: 'app-secret'
      @authStates = []
      @client.setCredentials key: 'app-key', secret: 'app-secret'
      expect(@authStates).to.deep.equal []

  describe '#appHash', ->
    it 'is consistent', ->
      client = new Dropbox.Client clientKeys
      expect(client.appHash()).to.equal @client.appHash()

    it 'is a non-trivial string', ->
      expect(@client.appHash()).to.be.a 'string'
      expect(@client.appHash().length).to.be.greaterThan 4

  describe '#isAuthenticated', ->
    it 'is true for a client with full tokens', ->
      expect(@client.isAuthenticated()).to.equal true

    it 'is false for a freshly reset client', ->
      @client.reset()
      expect(@client.isAuthenticated()).to.equal false

  describe '#authenticate', ->
    it 'fails to move from RESET without an OAuth driver', ->
      @client.reset()
      @client.authDriver null
      expect(=> @client.authenticate(->
        expect('authentication completed').to.equal false
      )).to.throw(Error, /authDriver/)

    it 'completes without an OAuth driver if already in DONE', (done) ->
      @client.authDriver null
      @client.authenticate (error, client) =>
        expect(error).to.equal null
        expect(client).to.equal @client
        done()

describe 'Dropbox.Client', ->
  describe 'with full Dropbox access', ->
    buildClientTests testFullDropboxKeys

  describe 'with Folder access', ->
    buildClientTests testKeys

    describe '#authenticate + #signOut', ->
      # NOTE: we're not duplicating this test in the full Dropbox acess suite,
      #       because it's annoying to the tester
      it 'completes the authenticate flow', (done) ->
        @timeout 45 * 1000  # Time-consuming because the user must click.
        @client.reset()
        @client.authDriver authDriver
        authStateChanges = ['authorize']
        @client.onAuthStateChange.addListener (client) ->
          authStateChanges.push client.authState
        @client.authenticate (error, client) =>
          expect(error).to.equal null
          expect(client).to.equal @client
          expect(client.authState).to.equal Dropbox.Client.DONE
          expect(client.isAuthenticated()).to.equal true
          expect(authStateChanges).to.deep.equal(['authorize',
              Dropbox.Client.REQUEST, Dropbox.Client.AUTHORIZED,
              Dropbox.Client.DONE])
          # Verify that we can do API calls.
          client.getUserInfo (error, userInfo) ->
            expect(error).to.equal null
            expect(userInfo).to.be.instanceOf Dropbox.UserInfo
            invalidCredentials = client.credentials()
            authStateChanges = ['signOff']
            client.signOut (error) ->
              expect(error).to.equal null
              expect(client.authState).to.equal Dropbox.Client.SIGNED_OFF
              expect(client.isAuthenticated()).to.equal false
              expect(authStateChanges).to.deep.equal(['signOff',
                  Dropbox.Client.SIGNED_OFF])
              # Verify that we can't use the old token in API calls.
              invalidClient = new Dropbox.Client invalidCredentials
              invalidClient.getUserInfo (error, userInfo) ->
                expect(error).to.be.ok
                unless Dropbox.Xhr.ieXdr  # IE's XDR doesn't do error codes.
                  expect(error.status).to.equal 401
                # Verify that the same client can be used for a 2nd signin.
                authStateChanges = ['authorize2']
                client.authenticate (error, client) ->
                  expect(error).to.equal null
                  expect(client.authState).to.equal Dropbox.Client.DONE
                  expect(client.isAuthenticated()).to.equal true
                  expect(authStateChanges).to.deep.equal(['authorize2',
                      Dropbox.Client.RESET, Dropbox.Client.REQUEST,
                      Dropbox.Client.AUTHORIZED, Dropbox.Client.DONE])
                  # Verify that we can do API calls after the 2nd signin.
                  client.getUserInfo (error, userInfo) ->
                    expect(error).to.equal null
                    expect(userInfo).to.be.instanceOf Dropbox.UserInfo
                    done()


    describe '#appHash', ->
      it 'depends on the app key', ->
        client = new Dropbox.Client testFullDropboxKeys
        expect(client.appHash()).not.to.equal @client.appHash()

    describe '#constructor', ->
      it 'raises an Error if initialized without an API key / secret', ->
        expect(-> new Dropbox.Client(token: '123', tokenSecret: '456')).to.
            throw(Error, /no api key/i)

