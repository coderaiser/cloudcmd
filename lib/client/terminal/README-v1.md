#jq-console

A simple jQuery terminal plugin written in CoffeeScript.

This project was spawned because of our need for a simple web terminal plugin 
for the <a href="http://github.com/amasad/jsrepl">jsREPL</a> project. It
tries to simulate a low level terminal by providing (almost) raw input/output
streams as well as input and output states.

##Tested Browsers

The plugin has been tested on the following browsers:

* IE 8
* Chrome 10
* Firefox 3.6
* Safari 4
* Opera 10

##Getting Started

###Instantiating

    var jqconsole = $(div).jqconsole(welcomeString);

* `div` is the div element or selector.
* `welcomeString` is the string to be shown when the terminal is first rendered.

###Configuration

There isn't much initial configuration needed, because the user must supply
options and callbacks with each state change. The only config method is used to
create custom shortcuts:

* `jqconsole.RegisterShortcut`: Registers a callback for a keyboard shortcut.
  It takes two arguments:

    * `int keyCode`: The code of the key pressing which (when Ctrl is held) will
      trigger this shortcut.

    * `function callback`: A function called when the shortcut is pressed;
      "this" will point to the JQConsole object.

    Example:

        // Ctrl+R: resets the console.
        jqconsole.RegisterShortCut(82, function() {
          this.Reset();
        });

##Usage

Unlike most terminal plugins, jq-console gives you complete low-level control
over the execution; you have to call the appropriate methods to start input
or output:

* `jqconsole.Input`: Asks user for input. It takes three arguments:

    * `bool history_enabled`: Whether this input should use history. If true,
      the user can select the input from history, and their input will also be
      added as a new history item.

    * `function result_callback`: A function called with the user's input when
      the user presses Enter and the input operation is complete.

    * `function multiline_callback`: If specified, this function is called when
      the user presses Enter to check whether the input should continue to the
      next line. If this function returns a falsy value, the input operation
      is completed. Otherwise, input continues and the cursor moves to the next 
      line.

    Example:

        jqconsole.Input(true, function(input) {
          alert(input);
        }, function (input) {
          return /\\$/.test('asdasd \\');
        });

* `jqconsole.Write`: Writes the given text to the console in a `<span>`, with an 
  optional class. This is used for output and writing prompt labels. It takes
  two arguments:

    * `string text`: The text to write.

    * `string cls`: The class to give the span containing the text. Optional.

    Examples:

        jqconsole.Write('>>>', 'prompt')
        jqconsole.Write(output, 'output')
        jqconsole.Write(err.message, 'error')

* `jqconsole.SetPromptText` Sets the text currently in the input prompt. Takes
  only one parameter:

    * `string text`: The text to put in the prompt.

    Examples:

        jqconsole.SetPromptText('ls')
        jqconsole.SetPromptText('print [i ** 2 for i in range(10)]')

##Contributors

[Max Shawabkeh](http://max99x.com/)  
[Amjad Masad](http://twitter.com/amjad_masad)
