Ansi = $().jqconsole.Ansi

CssPre = 'jqconsole-ansi-'

describe 'Ansi', ->
  describe '#_style', ->
    ansi = null
    beforeEach -> ansi = new Ansi()

    it 'applies and replaces font', ->
      ansi._style '11'      
      assert.deepEqual ["#{CssPre}fonts-1"], ansi.klasses
      ansi._style '19'
      assert.deepEqual ["#{CssPre}fonts-9"], ansi.klasses

    it 'applies and replaces color', ->
      ansi._style '31'
      assert.deepEqual ["#{CssPre}color-#{ansi._color(1)}"], ansi.klasses
      ansi._style '37'
      assert.deepEqual ["#{CssPre}color-#{ansi._color(7)}"], ansi.klasses
      ansi._style '39'
      assert.deepEqual [], ansi.klasses

    it 'applies and replaces background-color', ->
      ansi._style '41'
      assert.deepEqual ["#{CssPre}background-color-#{ansi._color(1)}"], ansi.klasses
      ansi._style '47'
      assert.deepEqual ["#{CssPre}background-color-#{ansi._color(7)}"], ansi.klasses
      ansi._style '49'
      assert.deepEqual [], ansi.klasses

  describe '#stylize', ->
    ansi = null
    beforeEach -> ansi = new Ansi()

    it 'appends a styles', ->
      html = ansi.stylize 'test\x1B[1mhello'
      assert.equal html, "<span class=\"\">test</span><span class=\"#{CssPre}bold\">hello</span>"

    it 'appends multiple styles', ->
      html = ansi.stylize 'test\x1B[1;2mhello'
      assert.equal html, "<span class=\"\">test</span><span class=\"#{CssPre}bold #{CssPre}lighter\">hello</span>"

    it 'appends multiple styles at different intervals', ->
      html = ansi.stylize 'test\x1B[1mhello\x1B[2mhi'
      assert.equal html, "<span class=\"\">test</span><span class=\"#{CssPre}bold\">hello</span><span class=\"#{CssPre}bold #{CssPre}lighter\">hi</span>"
      html = ansi.stylize 'a\x1B[53mb\x1B[21mc\x1B[md'
      assert.equal html, "<span class=\"#{CssPre}bold #{CssPre}lighter\">a</span><span class=\"#{CssPre}bold #{CssPre}lighter #{CssPre}overline\">b</span><span class=\"#{CssPre}overline\">c</span><span class=\"\">d</span>"


