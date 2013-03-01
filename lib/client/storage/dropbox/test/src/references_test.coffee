describe 'Dropbox.PublicUrl', ->
  describe '.parse', ->
    describe 'on the /shares API example', ->
      beforeEach ->
        urlData = {
          "url": "http://db.tt/APqhX1",
          "expires": "Tue, 01 Jan 2030 00:00:00 +0000"
        }
        @url = Dropbox.PublicUrl.parse urlData, false

      it 'parses url correctly', ->
        expect(@url).to.have.property 'url'
        expect(@url.url).to.equal 'http://db.tt/APqhX1'

      it 'parses expiresAt correctly', ->
        expect(@url).to.have.property 'expiresAt'
        expect(@url.expiresAt).to.be.instanceOf Date
        expect([
            'Tue, 01 Jan 2030 00:00:00 GMT',  # every sane JS platform
            'Tue, 1 Jan 2030 00:00:00 UTC'    # Internet Explorer
            ]).to.contain(@url.expiresAt.toUTCString())

      it 'parses isDirect correctly', ->
        expect(@url).to.have.property 'isDirect'
        expect(@url.isDirect).to.equal false

      it 'parses isPreview correctly', ->
        expect(@url).to.have.property 'isPreview'
        expect(@url.isPreview).to.equal true

      it 'round-trips through json / parse correctly', ->
        newUrl = Dropbox.PublicUrl.parse @url.json()
        newUrl.json()  # Get _json populated for newUrl.
        expect(newUrl).to.deep.equal @url

    it 'passes null through', ->
      expect(Dropbox.PublicUrl.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.PublicUrl.parse(undefined)).to.equal undefined


describe 'Dropbox.CopyReference', ->
  describe '.parse', ->
    describe 'on the API example', ->
      beforeEach ->
        refData = {
          "copy_ref": "z1X6ATl6aWtzOGq0c3g5Ng",
          "expires": "Fri, 31 Jan 2042 21:01:05 +0000"
        }
        @ref = Dropbox.CopyReference.parse refData

      it 'parses tag correctly', ->
        expect(@ref).to.have.property 'tag'
        expect(@ref.tag).to.equal 'z1X6ATl6aWtzOGq0c3g5Ng'

      it 'parses expiresAt correctly', ->
        expect(@ref).to.have.property 'expiresAt'
        expect(@ref.expiresAt).to.be.instanceOf Date
        expect([
            'Fri, 31 Jan 2042 21:01:05 GMT',  # every sane JS platform
            'Fri, 31 Jan 2042 21:01:05 UTC'   # Internet Explorer
            ]).to.contain(@ref.expiresAt.toUTCString())

      it 'round-trips through json / parse correctly', ->
        newRef = Dropbox.CopyReference.parse @ref.json()
        expect(newRef).to.deep.equal @ref

    describe 'on a reference string', ->
      beforeEach ->
        rawRef = 'z1X6ATl6aWtzOGq0c3g5Ng'
        @ref = Dropbox.CopyReference.parse rawRef

      it 'parses tag correctly', ->
        expect(@ref).to.have.property 'tag'
        expect(@ref.tag).to.equal 'z1X6ATl6aWtzOGq0c3g5Ng'

      it 'parses expiresAt correctly', ->
        expect(@ref).to.have.property 'expiresAt'
        expect(@ref.expiresAt).to.be.instanceOf Date
        expect(@ref.expiresAt - (new Date())).to.be.below 1000

      it 'round-trips through json / parse correctly', ->
        newRef = Dropbox.CopyReference.parse @ref.json()
        expect(newRef).to.deep.equal @ref

    it 'passes null through', ->
      expect(Dropbox.CopyReference.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.CopyReference.parse(undefined)).to.equal undefined

