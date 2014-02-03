{jqconsole, typer: {typeA, keyDown, type}} = jqconsoleSetup()

describe 'History', ->
  describe '#GetHistory', ->
    it 'gets the history', ->
      jqconsole.Prompt true, ->
      typeA()
      keyDown 13
      deepEqual ['a'], jqconsole.GetHistory()

  describe '#SetHistory', ->
    it 'sets history', ->
      h = ['a', 'b']
      jqconsole.SetHistory h
      deepEqual h, jqconsole.GetHistory()

  describe '#ResetHistory', ->
    it 'resets the history', ->
      jqconsole.ResetHistory()
      deepEqual jqconsole.history, []

  describe 'History interaction in the prompt', ->
    it 'gets the prev history item', ->
      jqconsole.Prompt true, ->
      type 'foo'
      equal jqconsole.GetPromptText(), 'foo'
      keyDown 13
      jqconsole.Prompt true, ->
      equal jqconsole.GetPromptText(), ''
      keyDown 38
      equal jqconsole.GetPromptText(), 'foo'
      jqconsole.AbortPrompt()

    it 'gets the next history item', ->
      jqconsole.Prompt true, ->
      type 'foo'
      keyDown 13
      jqconsole.Prompt true, ->
      type 'bar'
      keyDown 13
      jqconsole.Prompt true, ->
      keyDown 38
      equal jqconsole.GetPromptText(), 'bar'
      keyDown 38
      equal jqconsole.GetPromptText(), 'foo'
      keyDown 40
      equal jqconsole.GetPromptText(), 'bar'
      keyDown 40
      equal jqconsole.GetPromptText(), ''
