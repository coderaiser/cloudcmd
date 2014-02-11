{jqconsole, createScroll, typer: {typeA, keyDown, type}} = jqconsoleSetup()

describe 'Matching', ->
  afterEach ->
    jqconsole.AbortPrompt()

  describe '#RegisterMatching', ->
    it 'Adds matching', (done) ->
      jqconsole.Prompt true, ->
      jqconsole.RegisterMatching '(', ')', 'parens'
      type 'foo ( bar )'
      keyDown 39
      check = ->
        $parens = jqconsole.$prompt.find '.parens'
        assert.equal $parens.first().text(), '('
        assert.equal $parens.last().text(), ')'
        done()
      setTimeout check, 0

  describe '#UnRegsiterMatching', ->
    it 'Removes matching', (done) ->
      jqconsole.Prompt true, ->
      jqconsole.UnRegisterMatching '(', ')'
      type 'foo ( bar )'
      keyDown 39
      check = ->
        assert.ok !jqconsole.$prompt.find('.parens').length
        done()
      setTimeout check, 0
