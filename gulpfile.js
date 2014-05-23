(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
        concat      = require('gulp-concat'),
        mocha       = require('gulp-mocha'),
        
        cloudfunc   = require('./test/lib/cloudfunc.js'),
        Util        = require('./lib/util'),
        fs          = require('fs'),
        exec        = require('child_process').exec,
        Info        = require('./package'),
        
        LIB         = './lib/',
        LIB_CLIENT  = LIB + 'client/',
        LIB_SERVER  = LIB + 'server/',
        Src         = [
            './*.js',
            'test/**/*.js',
            LIB + '*.js',
            LIB_CLIENT + '/*.js',
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
            .on('error', onError);
    });
    
    gulp.task('test', function() {
       cloudfunc.check();
       
       gulp.src('test/lib/util.js')
           .pipe(mocha({reporter: 'min'}))
           .on('error', onError);
    });
    
    gulp.task('changelog', function() {
        var version = 'v' + Info.version,
            name    = 'ChangeLog';
        
        Util.execParallel([
            Util.bind(exec, 'shell/log.sh ' + version),
            Util.bind(fs.readFile, name),
            ], function(execParams, readParams) {
                var ERROR       = 0,
                    DATA        = 1,
                    STD_ERR     = 2,
                    error       = execParams[ERROR] || execParams[STD_ERR] || readParams[ERROR],
                    execData    = execParams[DATA],
                    fileData    = readParams[DATA],
                    date        = Util.getShortDate(),
                    head        = date + ', ' + version + '?\n\n',
                    data        = head + execData + fileData;
                
                if (error)
                    console.log(error);
                else
                    fs.writeFile(name, data, function(error) {
                        var msg = 'changelog: done';
                        
                        console.log(error || msg);
                    });
            });
    });
    
    gulp.task('default', ['jshint', 'css', 'test']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
