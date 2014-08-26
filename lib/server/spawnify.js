(function() {
    'use strict';
    
    var DIR             = './',
        DIR_LIB         = DIR + '../',
        
        path            = require('path'),
        child_process   = require('child_process'),
        
        exec            = child_process.exec,
        
        WIN             = process.platform === 'win32',
        spawn           = child_process.spawn,
        
        Util            = require(DIR_LIB   + 'util'),
        CloudFunc       = require(DIR_LIB   + 'cloudfunc'),
        
        addNewLine      = CloudFunc.addNewLine,
        
        find            = require(DIR       + 'find'),
        win             = require(DIR       + 'win');
        
        Util.exec.try(function() {
            find = require('glob');
        });
    
    module.exports = function(command, options, callback) {
        Util.checkArgs(arguments, ['command', 'callback']);
        
        if (!callback) {
            callback    = options;
            
            options     = {
                cwd: process.cwd()
            };
        }
        
        onMessage(command, options, callback);
    };
    
    
    function onMessage(command, options, callback) {
        var funcExec, firstChar,
            connName, ret,
            dir         = options.cwd,
            isVolume    = win.isChangeVolume(command),
            isCD        = /^cd ?/.test(command),
            isCDWin     = /^cd ?/i.test(command),
            
            symbolsExec = ['*', '&', '{', '}', '|', '\'', '"', ';'],
            isSymbol    = Util.isContainStr(command, symbolsExec);
        
        Util.checkArgs(arguments, ['connNum', 'callback', 'command']);
        
        if (isCD || isCDWin && WIN || isVolume) {
            ret = true;
            
            onCD(command, dir, function(error, json) {
                var path;
                
                if (json.path) {
                    path        = json.path;
                    options.cwd = path;
                }
                
                callback(json);
            });
        }
        
        if (!ret) {
            if (WIN)
                command    = 'cmd /C ' + command;
            
            funcExec = setExec.bind(null, callback);
            
            firstChar       = command[0];
            
            if (firstChar === '#') {
                command     = command.slice(1);
                command     = connName + command;
                command     = addNewLine(command);
                
                Util.exec(callback, { 
                    stdout: command
                }, true);
            } else if (firstChar === ' ' || isSymbol)
                exec(command, options, funcExec);
            else
                setSpawn(command, options, callback);
        }
    }
    
    /**
     * function send result of command to client
     * @param callback
     */
    function setExec(callback, error, stdout, stderr) {
        var json,
            errorStr    = '';
        
        if (stderr)
            errorStr    = stderr;
        else if (error)
            errorStr    = error.message;
        
        json            = {
            stdout : stdout,
            stderr : errorStr
        };
        
        callback(json, error, stderr);
    }
    
    function setSpawn(сommand, options, callback) {
        var cmd, error,
            isSended    = false,
            args        = сommand.split(' '),
            func        = function(error, stdout, stderr) {
                var errorStr = '';
                
                isSended = true;
                callback(error, stdout, stderr);
            
                if (error)
                    errorStr = error.message;
                else if (stderr)
                    errorStr = addNewLine(stderr);
                
                errorStr = addNewLine(errorStr);
                
                callback({
                    stderr: errorStr,
                    stdout: stdout
                });
            };
        
        Util.checkArgs(arguments, ['command', 'callback']);
        
        if (!callback) {
            callback    = options;
            options     = null;
        }
        
        сommand = args.shift();
        
        error   = Util.exec.tryLog(function() {
            cmd = spawn(сommand, args, options);
        });
        
        if (error) {
            callback(error);
        } else {
            cmd.stderr.setEncoding('utf8');
            cmd.stdout.setEncoding('utf8');
            
            cmd.stdout.on('data', function(data) {
                func(null, data);
            });
            
            cmd.stderr.on('data', function(error) {
                func(null, null, error);
            });
            
            cmd.on('error', function(error) {
                func(error);
            });
            
            cmd.on('close', function() {
                cmd = null;
                
                if (!isSended)
                    func();
            });
        }
    }
    
    function onCD(command, currDir, callback) {
        var CD              = 'cd ',
            HOME            = process.env.HOME,
            
            isChangeVolume  = win.isChangeVolume(command),
            isVolume        = win.isVolume(command),
            paramDir        = Util.rmStrOnce(command, [CD, 'cd']),
            
            regExpHome      = new RegExp('^~'),
            regExpRoot      = new RegExp('^[/\\\\]'),
            
            isWildCard      = Util.isContainStr(paramDir, ['*', '?']),
            isHome          = regExpHome.test(paramDir) && !WIN,
            isRoot          = regExpRoot.test(paramDir),
            
            onExec          = function (error, stdout, stderr) {
                var path        = paramDir,
                    errorStr    = '';
                
                if (stderr) {
                    errorStr    = stderr;
                } else if (error) {
                    errorStr    = error.message;
                    path        = '';
                }
                
                callback(error || stderr, {
                    stderr  : addNewLine(errorStr),
                    stdout  : stdout,
                    path    : path
                });
            };
        
        if (isHome) {
            command     = command.replace('~', HOME);
            paramDir    = paramDir.replace('~', HOME);
        }
        
        if (!paramDir && !WIN)
            paramDir = '.';
        
        if (!isChangeVolume || isVolume) {
            paramDir    = getFirstWord(paramDir);
            paramDir    = path.normalize(paramDir);
            
            command     = Util.rmStrOnce(command, [
                CD,
                paramDir,
                '\'' + paramDir + '\'',
                '"'  + paramDir + '"',
            ]);
            
            if (!isHome && !isRoot)
                paramDir    = path.join(currDir, paramDir);
            
            if (isWildCard)
                command = CD + paramDir + ' ' + command;
            else
                command = CD + '"' + paramDir + '" ' + command;
        }
        
        if (!isWildCard)
            exec(command, {cwd: paramDir}, onExec);
        else
            find(paramDir, function(error, dirs) {
                var dir;
                
                if (!error)
                    dir = dirs[0];
                    
                paramDir = dir;
                exec(command, {cwd: dir}, onExec);
            });
    }
    
    function getFirstWord(str) {
        var word, result,
            regStrEnd       = getRegStrEnd(),
            regStr          = '^(.*?)',
            regStrQuotes    = '^"(.*)"',
            regExp          = new RegExp(regStr + regStrEnd),
            regExpQuotes    = new RegExp(regStrQuotes + regStrEnd + '?'),
            is              = Util.isString(str);
        
        if (is) {
            result  = str.match(regExpQuotes);
            
            if (result) {
                word    = result[1];
            } else {
                result  = str.match(regExp);
                word    = result && result[1];
            }
            
            if (!word)
                word    = str;
        }
        
        return word;
    }
    
    function getRegStrEnd() {
        var regStrEnd = '(\\s|\\;|&&|\\|\\|)';
        
        return regStrEnd;
    }
    
})();
