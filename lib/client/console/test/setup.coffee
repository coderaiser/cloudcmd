window.equal = assert.equal
window.notEqual = assert.notEqual
window.deepEqual = assert.deepEqual
window.strictEqual = assert.strictEqual
window.ok = assert.ok
JQConsole = $().jqconsole.JQConsole

window.jqconsoleSetup = ->
  $container = $('<div/>').css
    height: '100px'
    widht: '200px'
    position: 'relative'
  $container.appendTo('body')
  jqconsole = new JQConsole($container, 'header', 'prompt_label', 'prompt_continue')
  typer =
    typeA: ->
      e = $.Event('keypress')
      e.which = 'a'.charCodeAt(0)
      jqconsole.$input_source.trigger e

    keyDown: (code, options = {}) ->
      e = $.Event('keydown')
      e.which = code
      e[k] = v for k, v of options
      jqconsole.$input_source.trigger e

    type: (str) ->
      type = (chr) ->
        e = $.Event('keypress')
        e.which = chr.charCodeAt(0)
        jqconsole.$input_source.trigger(e)
      type chr for chr in str

  createScroll = ->
    line_height = jqconsole.$prompt.height()
    console_height = jqconsole.$container.height()
    lines_per_page = Math.ceil(console_height / line_height)
    for i in [0..lines_per_page * 5]
      jqconsole.SetPromptText('foo')
      jqconsole._HandleEnter()
      jqconsole.Prompt true, ->
    {line_height, console_height, lines_per_page}

  {$container, jqconsole, typer, createScroll}
