(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
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
            '!' + LIB + 'promise.js',
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
            .on('error', onError);
    });
    
    gulp.task('test', function() {
       cloudfunc.check();
       
       gulp.src('test/lib/util.js')
           .pipe(mocha({reporter: 'min'}))
           .on('error', onError);
    });
    
    gulp.task('changelog', function() {
        var version     = 'v' + Info.version,
            name        = 'ChangeLog',
            versionNew  = getNewVersion();
        
        if (versionNew)
            versionNew = 'v' + versionNew;
        else
            versionNew  = version + '?';
        
        Util.exec.parallel([
            Util.exec.with(exec, 'shell/log.sh ' + version),
            Util.exec.with(fs.readFile, name, 'utf8'),
            ], function(error, execParams, fileData) {
                var DATA        = 0,
                    STD_ERR     = 1,
                    execData    = execParams[DATA],
                    date        = Util.getShortDate(),
                    head        = date + ', ' + versionNew + '\n\n',
                    data        = head + execData + fileData;
                
                error   = error || execParams[STD_ERR];
                
                if (error)
                    console.log(error);
                else
                    fs.writeFile(name, data, function(error) {
                        var msg = 'changelog: done';
                        
                        console.log(error || msg);
                    });
            });
    });
    
    gulp.task('package', function() {
        var data,
            msg         = 'ERROR: version is missing. gulp package --v<version>',
            version     = Info.version,
            versionNew  = getNewVersion();
        
        if (!versionNew) {
            console.log(msg);
        } else {
            Info.version    = versionNew;
            data            = JSON.stringify(Info, 0, 2) + '\n';
            Info.version    = version;
            
            fs.writeFile('package.json', data, function(error) {
                var msg = 'package: done';
                
                console.log(error || msg);
            });
        }
    });
    
    gulp.task('docs', function() {
        var history     = 'Version history\n---------------\n',
            link        = '//github.com/cloudcmd/archive/raw/master/cloudcmd',
            template    = '- *{{ date }}*, '    +
                          '**[v{{ version }}]'   +
                          '(' + link + '-v{{ version }}.zip)**\n',
            version     = Info.version,
            versionNew  = getNewVersion(),
            msg         = 'ERROR: version is missing. gulp docs --v<version>';
        
        if (!versionNew) {
            console.log(msg);
        } else {
            replaceVersion('README.md', version, versionNew);
            replaceVersion('HELP.md', version, versionNew);
            replaceVersion('HELP.md', history, history + Util.render(template, {
                date    : Util.getShortDate,
                version : versionNew
            }));
        }
    });
    
    gulp.task('default', ['jshint', 'css', 'test']);
    gulp.task('release', ['changelog', 'package', 'docs']);
    
    function onError(params) {
        console.log(params.message);
    }
    
    function getNewVersion() {
        var versionNew,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = new RegExp('^--'),
            isMatch     = last.match(regExp);
            
        if (isMatch)
            versionNew  = last.substr(3);
        
        return versionNew;
    }
    
    function replaceVersion(name, version, versionNew) {
         fs.readFile(name, 'utf8', function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    data = data.replace(version, versionNew);
                    
                    fs.writeFile(name, data, function(error) {
                        var msg = 'done: ' + name;
                        
                        console.log(error || msg);
                    });
                }
            });
    }
    
})();
