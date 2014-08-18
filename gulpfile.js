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
            .pipe(recess.reporter())
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
            
            gitTempl    = 'git log {{ version }}..HEAD --pretty=format:"- %s" --grep {{ category }} | sed  \'s/{{ category }}//g\'',
            
            gitFix      = Util.render(gitTempl, {
               category : 'fix' ,
               version  : version
            }),
            
            gitFeature  = Util.render(gitTempl, {
               category: 'feature',
               version  : version
            }),
            
            versionNew  = getNewVersion();
        
        if (versionNew)
            versionNew  = 'v' + versionNew;
        else
            versionNew  = version + '?';
        
        Util.exec.parallel([
            Util.exec.with(fs.readFile, name, 'utf8'),
            Util.exec.with(exec, gitFix),
            Util.exec.with(exec, gitFeature),
            ], function(error, fileData, fixData, featureData) {
                var DATA        = 0,
                    STD_ERR     = 1,
                    fix         = fixData[DATA],
                    feature     = featureData[DATA],
                    date        = Util.getShortDate(),
                    head        = date + ', ' + versionNew + '\n\n',
                    data        = '';
                
                console.log(fix || feature);
                
                if (fix || feature) {
                    data        = head;
                    
                    if (fix) {
                        data    += 'fix:'       + '\n';
                        data    += fix          + '\n\n';
                    }
                    
                    if (feature) {
                        data    += 'feature:'   + '\n';
                        data    += feature      + '\n\n';
                    }
                    
                    data        += '\n';
                    data        += fileData;
                }
                
                error   = error || fixData[STD_ERR] || featureData[STD_ERR];
                
                if (error)
                    console.log(error);
                else if (!data)
                    console.log('No new feature and fix commits from v', version);
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
            replaceVersion('HELP.md', version, versionNew, function() {
                var historyNew = history + Util.render(template, {
                    date    : Util.getShortDate,
                    version : versionNew
                });
                
                replaceVersion('HELP.md', history, historyNew);
            });
        }
    });
    
    gulp.task('default', ['jshint', 'css', 'test']);
    gulp.task('release', ['changelog', 'docs', 'package']);
    
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
    
    function replaceVersion(name, version, versionNew, callback) {
         fs.readFile(name, 'utf8', function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    data = data.replace(version, versionNew);
                    
                    fs.writeFile(name, data, function(error) {
                        var msg = 'done: ' + name;
                        
                        console.log(error || msg);
                        Util.exec(callback);
                    });
                }
            });
    }
    
})();
