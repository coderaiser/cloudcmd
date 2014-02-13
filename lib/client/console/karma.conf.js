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
      'test/matching-test.coffee',
      'test/misc-test.coffee',
    ],
    browsers: ['Chrome'],
    reporters: ['dots', 'coverage'],
    preprocessors: {
      'lib/*.js': ['coverage'],
      'test/*.coffee': ['coffee']
    },
    coffeePreprocessor: {
      // options passed to the coffee compiler
      options: {
        bare: false,
      }
    },
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    }
  });
};
