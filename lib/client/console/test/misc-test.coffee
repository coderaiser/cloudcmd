jqconsole = type = keyDown = null

describe 'Misc methods', ->
  beforeEach ->
    {jqconsole, typer: {keyDown, type}} = jqconsoleSetup()
    jqconsole.Prompt true, ->

  describe '#GetColumn', ->
    it 'should get the column number of the cursor', ->
      label_length = 'headerprompt_label'.length
      assert.equal jqconsole.GetColumn(), label_length
      type '   '
      assert.equal jqconsole.GetColumn(), label_length + 3

  describe '#GetLine', ->
    it 'should get the line number of the cursor', ->
      assert.equal jqconsole.GetLine(), 0
      keyDown 13, shiftKey: on
      assert.equal jqconsole.GetLine(), 1
      keyDown 13, shiftKey: on
      assert.equal jqconsole.GetLine(), 2

  describe '#SetIndentWidth', ->
    it 'changes the indent width', ->
      l = jqconsole.GetColumn()
      jqconsole.SetIndentWidth 10
      keyDown 9
      assert.equal jqconsole.GetColumn(), l + 10

  describe '#GetIndentWidth', ->
    it 'gets the indent width', ->
      jqconsole.SetIndentWidth 20
      assert.equal jqconsole.GetIndentWidth(), 20

  describe '#Dump', ->
    it 'dumps the console content', ->
      type 'foo'
      keyDown 13
      jqconsole.Write('wat')
      assert.equal jqconsole.Dump(), 'headerprompt_labelfoo\nwat'

  describe '#SetPromptLabel', ->
    it 'Sets the prompt label for the next prompt', ->
      jqconsole.SetPromptLabel 'foobar123', 'shitmang'
      keyDown 13, shiftKey: on
      jqconsole.AbortPrompt()
      jqconsole.Prompt true, ->
      assert.ok jqconsole.Dump().indexOf 'foobar123' > -1
      assert.ok jqconsole.Dump().indexOf 'shitmang' > -1

  describe '#Disable', ->
    it 'disables the console', ->
      jqconsole.Disable()
      assert.ok jqconsole.$input_source.attr 'disabled'

  describe '#Enable', ->
    it 'enables the console', ->
      jqconsole.Disable()
      jqconsole.Enable()
      assert.ok not jqconsole.$input_source.attr 'disabled'

  describe '#Clear', ->
    it 'clears the console', ->
      jqconsole.Clear()
      assert.equal jqconsole.Dump(), ''
