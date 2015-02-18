(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
        mocha       = require('gulp-mocha'),
        jscs        = require('gulp-jscs'),
        
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
            LIB_CLIENT + 'storage/*.js',
            LIB_SERVER + '/**/*.js',
            '!' + LIB + 'diff/diff-match-patch.js',
            '!' + LIB + 'promise.js',
            '!' + LIB_CLIENT + 'jquery.js'
        ];
    
    ['changelog', 'docs', 'package'].forEach(function(name) {
        gulp.task(name, function() {
            var task = require('./gulp/tasks/' + name);
            
            task(function(error, msg) {
                if (error)
                    console.error(error.message);
                else
                    console.log(msg);
            });
        }.bind(null, name));
    });
    
    gulp.task('jshint', function() {
        gulp.src(Src)
            .pipe(jshint())
            .pipe(jshint.reporter())
            .on('error', onError);
    });
    
    gulp.task('jscs', function () {
        return gulp.src(Src)
            .pipe(jscs());
    });
    
    gulp.task('css', function () {
        gulp.src('css/*.css')
            .pipe(recess())
            .pipe(recess.reporter())
            .on('error', onError);
    });
    
    gulp.task('test', function() {
       cloudfunc.check();
       
       gulp.src('test/lib/util.js')
           .pipe(mocha({reporter: 'min'}))
           .on('error', onError);
    });
    
    gulp.task('default', ['jshint', 'jscs', 'css', 'test']);
    gulp.task('release', ['changelog', 'docs', 'package']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
