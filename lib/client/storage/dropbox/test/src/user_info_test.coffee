describe 'Dropbox.UserInfo', ->
  describe '.parse', ->
    describe 'on the API example', ->
      beforeEach ->
        userData = {
          "referral_link": "https://www.dropbox.com/referrals/r1a2n3d4m5s6t7",
          "display_name": "John P. User",
          "uid": 12345678,
          "country": "US",
          "quota_info": {
            "shared": 253738410565,
            "quota": 107374182400000,
            "normal": 680031877871
          },
          "email": "johnpuser@company.com"  # Added to reflect real responses.
        }
        @userInfo = Dropbox.UserInfo.parse userData

      it 'parses name correctly', ->
        expect(@userInfo).to.have.property 'name'
        expect(@userInfo.name).to.equal 'John P. User'

      it 'parses email correctly', ->
        expect(@userInfo).to.have.property 'email'
        expect(@userInfo.email).to.equal 'johnpuser@company.com'

      it 'parses countryCode correctly', ->
        expect(@userInfo).to.have.property 'countryCode'
        expect(@userInfo.countryCode).to.equal 'US'

      it 'parses uid correctly', ->
        expect(@userInfo).to.have.property 'uid'
        expect(@userInfo.uid).to.equal '12345678'

      it 'parses referralUrl correctly', ->
        expect(@userInfo).to.have.property 'referralUrl'
        expect(@userInfo.referralUrl).to.
            equal 'https://www.dropbox.com/referrals/r1a2n3d4m5s6t7'

      it 'parses quota correctly', ->
        expect(@userInfo).to.have.property 'quota'
        expect(@userInfo.quota).to.equal 107374182400000

      it 'parses usedQuota correctly', ->
        expect(@userInfo).to.have.property 'usedQuota'
        expect(@userInfo.usedQuota).to.equal 933770288436

      it 'parses privateBytes correctly', ->
        expect(@userInfo).to.have.property 'privateBytes'
        expect(@userInfo.privateBytes).to.equal 680031877871

      it 'parses sharedBytes correctly', ->
        expect(@userInfo).to.have.property 'usedQuota'
        expect(@userInfo.sharedBytes).to.equal 253738410565

      it 'parses publicAppUrl correctly', ->
        expect(@userInfo.publicAppUrl).to.equal null

      it 'round-trips through json / parse correctly', ->
        newInfo = Dropbox.UserInfo.parse @userInfo.json()
        expect(newInfo).to.deep.equal @userInfo

    it 'passes null through', ->
      expect(Dropbox.UserInfo.parse(null)).to.equal null

    it 'passes undefined through', ->
      expect(Dropbox.UserInfo.parse(undefined)).to.equal undefined


    describe 'on real data from a "public app folder" application', ->
      beforeEach ->
        userData = {
          "referral_link": "https://www.dropbox.com/referrals/NTM1OTg4MTA5",
          "display_name": "Victor Costan",
          "uid": 87654321,  # Anonymized.
          "public_app_url": "https://dl-web.dropbox.com/spa/90vw6zlu4268jh4/",
          "country": "US",
          "quota_info": {
            "shared": 6074393565,
            "quota": 73201090560,
            "normal": 4684642723
          },
          "email": "spam@gmail.com"  # Anonymized.
        }
        @userInfo = Dropbox.UserInfo.parse userData

      it 'parses publicAppUrl correctly', ->
        expect(@userInfo.publicAppUrl).to.
          equal 'https://dl-web.dropbox.com/spa/90vw6zlu4268jh4'

      it 'round-trips through json / parse correctly', ->
        newInfo = Dropbox.UserInfo.parse @userInfo.json()
        expect(newInfo).to.deep.equal @userInfo


