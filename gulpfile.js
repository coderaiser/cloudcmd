(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
        mocha       = require('gulp-mocha'),
        jscs        = require('gulp-jscs'),
        
        docs        = require('./gulp/docs'),
        
        cloudfunc   = require('./test/lib/cloudfunc.js'),
        
        LIB         = 'lib/',
        LIB_CLIENT  = LIB + 'client/',
        LIB_SERVER  = LIB + 'server/',
        Src         = [
            '*.js',
            'test/**/*.js',
            'gulp/**/*.js',
            LIB + '*.js',
            LIB_CLIENT + '/*.js',
            LIB_SERVER + '/**/*.js'
        ];
    
    gulp.task('release', function() {
        docs(function(e, msg) {
            error(e) || console.log(msg);
        });
    });
    
    gulp.task('jshint', function() {
        gulp.src(Src)
            .pipe(jshint())
            .pipe(jshint.reporter())
            .on('error', error);
    });
    
    gulp.task('jscs', function () {
        return gulp.src(Src)
            .pipe(jscs());
    });
    
    gulp.task('css', function () {
        gulp.src('css/*.css')
            .pipe(recess())
            .pipe(recess.reporter())
            .on('error', error);
    });
    
    gulp.task('test', function() {
       cloudfunc.check();
       
       gulp.src('test/lib/util.js')
           .pipe(mocha({reporter: 'min'}))
           .on('error', error);
    });
    
    gulp.task('default', ['jshint', 'jscs', 'css', 'test']);
    
    function error(e) {
        e && console.error(e.message);
        return e;
    }
    
})();
