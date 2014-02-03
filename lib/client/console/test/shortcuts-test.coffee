{jqconsole, typer: {keyDown}} = jqconsoleSetup()

describe 'Shortcuts', ->
  describe '#RegisterShortcut', ->
    # Fails in v2.7.7
    it 'throws if callback not function', ->
      assert.throws ->
        jqconsole.RegisterShortcut 'b', 'c'

    it 'registers shortcut by string', ->
      cb = ->
      jqconsole.RegisterShortcut 'a', cb
      deepEqual jqconsole.shortcuts['a'.charCodeAt(0)], [cb]
      deepEqual jqconsole.shortcuts['A'.charCodeAt(0)], [cb]

    it 'registers shortcut by charcode', ->
      cb = ->
      jqconsole.RegisterShortcut 'c'.charCodeAt(0), cb
      deepEqual jqconsole.shortcuts['c'.charCodeAt(0)], [cb]
      deepEqual jqconsole.shortcuts['C'.charCodeAt(0)], [cb]

    it 'shortcuts must be ascii', ->
      assert.throws ->
        jqconsole.RegisterShortcut 'ƒ', ->

  describe '#UnRegisterShortcut', ->

    it 'removes all callback for a shortcut', ->
      cb = ->
      jqconsole.RegisterShortcut 'a', cb
      jqconsole.UnRegisterShortcut 'a'
      deepEqual jqconsole.shortcuts['a'.charCodeAt(0)], undefined

    it 'removes specific callback', ->
      aCb = ->
      bCb = ->
      jqconsole.RegisterShortcut 'a', aCb
      jqconsole.RegisterShortcut 'a', bCb
      jqconsole.UnRegisterShortcut 'a', aCb
      deepEqual jqconsole.shortcuts['a'.charCodeAt(0)], [bCb]

  describe '#ResetShortcuts', ->

    it 'resets all shortcuts', ->
      cb1 = ->
      cb2 = ->
      jqconsole.RegisterShortcut 'a', cb1
      jqconsole.RegisterShortcut 'b', cb2
      jqconsole.ResetShortcuts()
      deepEqual jqconsole.shortcuts, {}

  describe 'Invoking Shortcuts', ->
    it 'invokes shortcuts', ->
      jqconsole.Prompt true, ->
      counter = 0
      jqconsole.RegisterShortcut 'a', ->
        strictEqual this, jqconsole
        counter++
      keyDown 'a'.charCodeAt(0), metaKey: on
      ok counter
