(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
        concat      = require('gulp-concat'),
        stylestats  = require('gulp-stylestats'),
        test        = require('./test/test.js'),
        
        LIB         = './lib/',
        LIB_CLIENT  = LIB + 'client/',
        LIB_SERVER  = LIB + 'server/',
        Src         = [
            './*.js',
            LIB + '*.js',
            LIB_CLIENT + 'storage/*.js',
            LIB_SERVER + '/**/*.js',
            '!' + LIB + 'diff/diff-match-patch.js',
            '!' + LIB_CLIENT + 'jquery.js'
        ];
    
    gulp.task('jshint', function() {
        gulp.src(Src)
            .pipe(jshint())
            .pipe(jshint.reporter())
            .on('error', onError);
    });
    
   
    gulp.task('css', function () {
        gulp.src('css/*.css')
            .pipe(recess())
            .pipe(concat('all.css'))
            .pipe(stylestats())
            .on('error', onError);
    });
    
    gulp.task('test', function() {
       test.check();
    });
    
    gulp.task('default', ['jshint', 'css', 'test']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
