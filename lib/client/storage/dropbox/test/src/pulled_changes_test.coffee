describe 'Dropbox.PulledChanges', ->
  describe '.parse', ->
    describe 'on a sample response', ->
      beforeEach ->
        deltaInfo = {
          "reset": false,
          "cursor": "nTZYLOcTQnyB7-Wc72M-kEAcBQdk2EjLaJIRupQWgDXmRwKWzuG5V4se2mvU7yzXn4cZSJltoW4tpbqgy0Ezxh1b1p3ygp7wy-vdaYJusujnLAyEsKdYCHPZYZdZt7sQG0BopF2ufAuD56ijYbdX5DhMKe85MFqncnFDvNxSjsodEw-IkCfNZmagDmpOZCxmLqu71hLTApwhqO9-dhm-fk6KSYs-OZwRmVwOE2JAnJbWuifNiM8KwMz5sRBZ5FMJPDqXpOW5PqPCwbkAmKQACbNXFi0k1JuxulpDlQh3zMr3lyLMs-fmaDTTU355mY5xSAXK05Zgs5rPJ6lcaBOUmEBSXcPhxFDHk5NmAdA03Shq04t2_4bupzWX-txT84FmOLNncchl7ZDBCMwyrAzD2kCYOTu1_lhui0C-fiCZgZBKU4OyP6qrkdo4gZu3",
          "has_more": true,
          "entries": [
            [
              "/Getting_Started.pdf",
              {
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
            ],
            [
              "/Public",
              null
            ]
          ]
        }
        @changes = Dropbox.PulledChanges.parse deltaInfo

      it 'parses blankSlate correctly', ->
        expect(@changes).to.have.property 'blankSlate'
        expect(@changes.blankSlate).to.equal false

      it 'parses cursorTag correctly', ->
        expect(@changes).to.have.property 'cursorTag'
        expect(@changes.cursorTag).to.equal 'nTZYLOcTQnyB7-Wc72M-kEAcBQdk2EjLaJIRupQWgDXmRwKWzuG5V4se2mvU7yzXn4cZSJltoW4tpbqgy0Ezxh1b1p3ygp7wy-vdaYJusujnLAyEsKdYCHPZYZdZt7sQG0BopF2ufAuD56ijYbdX5DhMKe85MFqncnFDvNxSjsodEw-IkCfNZmagDmpOZCxmLqu71hLTApwhqO9-dhm-fk6KSYs-OZwRmVwOE2JAnJbWuifNiM8KwMz5sRBZ5FMJPDqXpOW5PqPCwbkAmKQACbNXFi0k1JuxulpDlQh3zMr3lyLMs-fmaDTTU355mY5xSAXK05Zgs5rPJ6lcaBOUmEBSXcPhxFDHk5NmAdA03Shq04t2_4bupzWX-txT84FmOLNncchl7ZDBCMwyrAzD2kCYOTu1_lhui0C-fiCZgZBKU4OyP6qrkdo4gZu3'

      it 'parses shouldPullAgain correctly', ->
        expect(@changes).to.have.property 'shouldPullAgain'
        expect(@changes.shouldPullAgain).to.equal true

      it 'parses shouldBackOff correctly', ->
        expect(@changes).to.have.property 'shouldBackOff'
        expect(@changes.shouldBackOff).to.equal false

      it 'parses changes correctly', ->
        expect(@changes).to.have.property 'changes'
        expect(@changes.changes).to.have.length 2
        expect(@changes.changes[0]).to.be.instanceOf Dropbox.PullChange
        expect(@changes.changes[0].path).to.equal '/Getting_Started.pdf'
        expect(@changes.changes[1]).to.be.instanceOf Dropbox.PullChange
        expect(@changes.changes[1].path).to.equal '/Public'

    it 'passes null through', ->
      expect(Dropbox.PulledChanges.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.PulledChanges.parse(undefined)).to.equal undefined


describe 'Dropbox.PullChange', ->
  describe '.parse', ->
    describe 'on a modification change', ->
      beforeEach ->
        entry = [
          "/Getting_Started.pdf",
          {
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
        ]
        @changes = Dropbox.PullChange.parse entry

      it 'parses path correctly', ->
        expect(@changes).to.have.property 'path'
        expect(@changes.path).to.equal '/Getting_Started.pdf'

      it 'parses wasRemoved correctly', ->
        expect(@changes).to.have.property 'wasRemoved'
        expect(@changes.wasRemoved).to.equal false

      it 'parses stat correctly', ->
        expect(@changes).to.have.property 'stat'
        expect(@changes.stat).to.be.instanceOf Dropbox.Stat
        expect(@changes.stat.path).to.equal @changes.path

    describe 'on a deletion change', ->
      beforeEach ->
        entry = [
          "/Public",
          null
        ]
        @changes = Dropbox.PullChange.parse entry

      it 'parses path correctly', ->
        expect(@changes).to.have.property 'path'
        expect(@changes.path).to.equal '/Public'

      it 'parses wasRemoved correctly', ->
        expect(@changes).to.have.property 'wasRemoved'
        expect(@changes.wasRemoved).to.equal true

      it 'parses stat correctly', ->
        expect(@changes).to.have.property 'stat'
        expect(@changes.stat).to.equal null

    it 'passes null through', ->
      expect(Dropbox.PullChange.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.PullChange.parse(undefined)).to.equal undefined


