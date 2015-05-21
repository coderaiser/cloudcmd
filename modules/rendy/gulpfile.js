(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        mocha       = require('gulp-mocha');
    
    gulp.task('test', function() {
       gulp.src('test/test.js')
           .pipe(mocha({reporter: 'min'}))
           .on('error', onError);
    });
    
    gulp.task('default', ['test']);
    
    function onError(error) {
        console.log(error.message);
    }
})();
