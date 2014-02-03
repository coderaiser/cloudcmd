module.exports = function(config) {
  config.set({
    frameworks: ["mocha"],
    files: [
      'test/vendor/*.js',
      'lib/*.js',
      'test/setup.coffee',
      'test/ansi-test.coffee',
      'test/jqconsole-test.coffee',
      'test/prompt-test.coffee',
      'test/shortcuts-test.coffee',
      'test/history-test.coffee',
    ],
    browsers: ['Chrome'],
    reporters: ['dots'],
    coffeePreprocessor: {
      // options passed to the coffee compiler
      options: {
        bare: false,
      }
    },
  });
};
