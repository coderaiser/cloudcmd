
describe 'JQConsole', ->
  {$container, jqconsole} = jqconsoleSetup()
  describe '#constructor', ->

    it 'instantiates', ->
      equal jqconsole.header, 'header'
      equal jqconsole.prompt_label_main, 'prompt_label'
      equal jqconsole.prompt_label_continue, 'prompt_continue'
      equal jqconsole.indent_width, 2
      equal jqconsole.GetState(), 'output'
      deepEqual jqconsole.input_queue, []
      deepEqual jqconsole.history, []
      ok jqconsole.$console.length
      ok jqconsole.$console instanceof jQuery
      equal $container.text().trim(), 'header'
      strictEqual $container.data('jqconsole'), jqconsole
      ok jqconsole.$prompt.length
      ok jqconsole.$input_source.length

    it 'setup events', (done)->
      counter = 0
      jqconsole.$input_source.focus ->
        counter++
      jqconsole.$console.mouseup()
      fn = -> 
        ok counter
        done()
      setTimeout fn, 10
