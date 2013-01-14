describe 'Dropbox.Stat', ->
  describe '.parse', ->
    describe 'on the API file example', ->
      beforeEach ->
        # File example at
        #   https://www.dropbox.com/developers/reference/api#metadata
        metadata = {
          "size": "225.4KB",
          "rev": "35e97029684fe",
          "thumb_exists": true,  # Changed to test hasThumbnail=true code.
          "bytes": 230783,
          "modified": "Tue, 19 Jul 2011 21:55:38 +0000",
          "client_mtime": "Mon, 18 Jul 2011 18:04:35 +0000",
          "path": "/Getting_Started.pdf",
          "is_dir": false,
          "icon": "page_white_acrobat",
          "root": "app_folder",  # Changed to test app_folder code path.
          "mime_type": "application/pdf",
          "revision": 220823
        }
        @stat = Dropbox.Stat.parse metadata

      it 'parses the path correctly', ->
        expect(@stat).to.have.property 'path'
        expect(@stat.path).to.equal '/Getting_Started.pdf'

      it 'parses name correctly', ->
        expect(@stat).to.have.property 'name'
        expect(@stat.name).to.equal 'Getting_Started.pdf'

      it 'parses inAppFolder corectly', ->
        expect(@stat).to.have.property 'inAppFolder'
        expect(@stat.inAppFolder).to.equal true

      it 'parses isFolder correctly', ->
        expect(@stat).to.have.property 'isFolder'
        expect(@stat.isFolder).to.equal false
        expect(@stat).to.have.property 'isFile'
        expect(@stat.isFile).to.equal true

      it 'parses isRemoved correctly', ->
        expect(@stat).to.have.property 'isRemoved'
        expect(@stat.isRemoved).to.equal false

      it 'parses typeIcon correctly', ->
        expect(@stat).to.have.property 'typeIcon'
        expect(@stat.typeIcon).to.equal 'page_white_acrobat'

      it 'parses versionTag correctly', ->
        expect(@stat).to.have.property 'versionTag'
        expect(@stat.versionTag).to.equal '35e97029684fe'

      it 'parses mimeType correctly', ->
        expect(@stat).to.have.property 'mimeType'
        expect(@stat.mimeType).to.equal 'application/pdf'

      it 'parses size correctly', ->
        expect(@stat).to.have.property 'size'
        expect(@stat.size).to.equal 230783

      it 'parses humanSize correctly', ->
        expect(@stat).to.have.property 'humanSize'
        expect(@stat.humanSize).to.equal "225.4KB"

      it 'parses hasThumbnail correctly', ->
        expect(@stat).to.have.property 'hasThumbnail'
        expect(@stat.hasThumbnail).to.equal true

      it 'parses modifiedAt correctly', ->
        expect(@stat).to.have.property 'modifiedAt'
        expect(@stat.modifiedAt).to.be.instanceOf Date
        expect([
            'Tue, 19 Jul 2011 21:55:38 GMT',  # every sane JS platform
            'Tue, 19 Jul 2011 21:55:38 UTC'    # Internet Explorer
            ]).to.contain(@stat.modifiedAt.toUTCString())

      it 'parses clientModifiedAt correctly', ->
        expect(@stat).to.have.property 'clientModifiedAt'
        expect(@stat.clientModifiedAt).to.be.instanceOf Date
        expect([
            'Mon, 18 Jul 2011 18:04:35 GMT',  # every sane JS platform
            'Mon, 18 Jul 2011 18:04:35 UTC'    # Internet Explorer
            ]).to.contain(@stat.clientModifiedAt.toUTCString())

      it 'round-trips through json / parse correctly', ->
        newStat = Dropbox.Stat.parse @stat.json()
        expect(newStat).to.deep.equal @stat


    describe 'on the API directory example', ->
      beforeEach ->
        # Folder example at
        #   https://www.dropbox.com/developers/reference/api#metadata
        metadata = {
          "size": "0 bytes",
          "hash": "37eb1ba1849d4b0fb0b28caf7ef3af52",
          "bytes": 0,
          "thumb_exists": false,
          "rev": "714f029684fe",
          "modified": "Wed, 27 Apr 2011 22:18:51 +0000",
          "path": "/Public",
          "is_dir": true,
          "is_deleted": true,  # Added to test isRemoved=true code path.
          "icon": "folder_public",
          "root": "dropbox",
          "revision": 29007
        }
        @stat = Dropbox.Stat.parse metadata

      it 'parses path correctly', ->
        expect(@stat).to.have.property 'path'
        expect(@stat.path).to.equal '/Public'

      it 'parses name correctly', ->
        expect(@stat).to.have.property 'name'
        expect(@stat.name).to.equal 'Public'

      it 'parses inAppFolder corectly', ->
        expect(@stat).to.have.property 'inAppFolder'
        expect(@stat.inAppFolder).to.equal false

      it 'parses isFolder correctly', ->
        expect(@stat).to.have.property 'isFolder'
        expect(@stat.isFolder).to.equal true
        expect(@stat).to.have.property 'isFile'
        expect(@stat.isFile).to.equal false

      it 'parses isRemoved correctly', ->
        expect(@stat).to.have.property 'isRemoved'
        expect(@stat.isRemoved).to.equal true

      it 'parses typeIcon correctly', ->
        expect(@stat).to.have.property 'typeIcon'
        expect(@stat.typeIcon).to.equal 'folder_public'

      it 'parses versionTag correctly', ->
        expect(@stat).to.have.property 'versionTag'
        expect(@stat.versionTag).to.equal '37eb1ba1849d4b0fb0b28caf7ef3af52'

      it 'parses mimeType correctly', ->
        expect(@stat).to.have.property 'mimeType'
        expect(@stat.mimeType).to.equal 'inode/directory'

      it 'parses size correctly', ->
        expect(@stat).to.have.property 'size'
        expect(@stat.size).to.equal 0

      it 'parses humanSize correctly', ->
        expect(@stat).to.have.property 'humanSize'
        expect(@stat.humanSize).to.equal '0 bytes'

      it 'parses hasThumbnail correctly', ->
        expect(@stat).to.have.property 'hasThumbnail'
        expect(@stat.hasThumbnail).to.equal false

      it 'parses modifiedAt correctly', ->
        expect(@stat).to.have.property 'modifiedAt'
        expect(@stat.modifiedAt).to.be.instanceOf Date
        expect([
            'Wed, 27 Apr 2011 22:18:51 GMT',  # every sane JS platform
            'Wed, 27 Apr 2011 22:18:51 UTC'    # Internet Explorer
            ]).to.contain(@stat.modifiedAt.toUTCString())

      it 'parses missing clientModifiedAt correctly', ->
        expect(@stat).to.have.property 'clientModifiedAt'
        expect(@stat.clientModifiedAt).to.equal null

      it 'round-trips through json / parse correctly', ->
        newStat = Dropbox.Stat.parse @stat.json()
        expect(newStat).to.deep.equal @stat

    it 'passes null through', ->
      expect(Dropbox.Stat.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.Stat.parse(undefined)).to.equal undefined

    describe 'on a contrived file/path example', ->
      beforeEach ->
        metadata = {
          "size": "225.4KB",
          "rev": "35e97029684fe",
          "thumb_exists": true,  # Changed to test hasThumbnail=true code.
          "bytes": 230783,
          "modified": "Tue, 19 Jul 2011 21:55:38 +0000",
          "client_mtime": "Mon, 18 Jul 2011 18:04:35 +0000",
          "path": "path/to/a/file/named/Getting_Started.pdf/",
          "is_dir": false,
          "icon": "page_white_acrobat",
          "root": "app_folder",  # Changed to test app_folder code path.
          "mime_type": "application/pdf",
          "revision": 220823
        }
        @stat = Dropbox.Stat.parse metadata

      it 'parses the path correctly', ->
        expect(@stat).to.have.property 'path'
        expect(@stat.path).to.equal '/path/to/a/file/named/Getting_Started.pdf'

      it 'parses name correctly', ->
        expect(@stat).to.have.property 'name'
        expect(@stat.name).to.equal 'Getting_Started.pdf'


