(function() {
    'use strict';
    
    var DIR             = '../',
        DIR_ROOT        = DIR + '../',
        DIR_SERVER      = './',
        
        path            = require('path'),
        child_process   = require('child_process'),
        exec            = child_process.exec,
        
        Util            = require(DIR           + 'util'),
        CloudFunc       = require(DIR           + 'cloudfunc'),
        
        win             = require(DIR_SERVER    + 'win'),
        update          = require(DIR_SERVER    + 'update'),
        socket          = require(DIR_SERVER    + 'socket'),
        find            = require(DIR_SERVER    + 'find'),
        pawn            = require(DIR_SERVER    + 'pawn'),
        
        mainpackage     = require(DIR_ROOT      + 'package'),
        CLOUDCMD        = mainpackage.name,
        
        equalPart       = Util.isContainStrAtBegin,
        
        ClientFuncs     = [],
        ClientDirs      = [],
        Clients         = [],
        WIN             = process.platform === 'win32',
        
        addNewLine      = CloudFunc.addNewLine,
        
        ConNum          = 0,
        
        CHANNEL         = CloudFunc.CHANNEL_CONSOLE,
        
        HELP            = {
            stdout  : CLOUDCMD + ' exit     \n' +
                      CLOUDCMD + ' update   \n',
        };
        
        Util.exec.try(function() {
            find = require('glob');
        });
    
    /**
     * function listen on servers port
     * @pServer {Object} started server object
     */
    exports.init = function() {
        var ret;
        
        ret = socket.on('connection', function(clientSocket) {
            onConnection(clientSocket, function(json) {
                socket.emit(CHANNEL, json, clientSocket);
            });
        });
        
        return ret;
    };
    
    function onConnection(clientSocket, callback) {
        var msg, onDisconnect, onMessage;
        
        ++ConNum;
        
        Util.checkArgs(arguments, ['clientSocket', 'callback']);
        
        if (!Clients[ConNum]) {
            msg = log(ConNum, 'console connected');
            
            callback({
                stdout  : addNewLine(msg),
                path    : process.cwd()
            });
            
            Clients[ConNum]             = true;
            
            onMessage                   = Util.exec.with(getOnMessage, ConNum, callback);
            onDisconnect                = function(conNum) {
                Clients[conNum]         =
                ClientFuncs[conNum]     = null;
                
                log(conNum, 'console disconnected');
                
                socket.removeListener(CHANNEL, onMessage, clientSocket);
                socket.removeListener('disconnect', onDisconnect, clientSocket);
            }.bind(null, ConNum);
            
            socket.on(CHANNEL, onMessage, clientSocket);
            socket.on('disconnect', onDisconnect, clientSocket);
        } else {
            msg = log(ConNum, ' in use. Reconnecting...\n');
            
            callback({
                stdout: msg
            });
            
            socket.disconnect();
        }
    }
    
    /**
     * function gets onMessage function 
     * that execute needed command
     * 
     * @param pConnNum
     * @param callback
     */
    function getOnMessage(connNum, callback, command) {
        var funcExec, firstChar,
            connName, ret,
            
            isVolume    = win.isChangeVolume(command),
            isCD        = /^cd ?/.test(command),
            isCDWin     = /^cd ?/i.test(command),
            
            symbolsExec = ['*', '&', '{', '}', '|', '\'', '"', ';'],
            isSymbol    = Util.isContainStr(command, symbolsExec),
            
            CWD         = process.cwd(),
            dir         = ClientDirs[connNum],
            options     = {
                cwd:    dir || CWD
            };
        
        Util.checkArgs(arguments, ['connNum', 'callback', 'command']);
        
        if (!dir)
            dir = ClientDirs[connNum] = CWD;
        
        connName = '#' + connNum + ': ';
        Util.log(connName + command);
        
        if (equalPart(command, CLOUDCMD)) 
            ret = onCloudCmd(command, callback);
        else if (isCD || isCDWin && WIN || isVolume) {
            ret = true;
            
            onCD(command, dir, function(error, json) {
                var path;
                
                if (json.path) {
                    path                = json.path;
                    ClientDirs[connNum] = path;
                }
                
                callback(json);
            });
        }
        
        if (!ret) {
            if (WIN)
                command    = 'cmd /C ' + command;
            
            if (!ClientFuncs[connNum])
                ClientFuncs[connNum] = setExec.bind(null, function(json, error, stderr) {
                    log(connNum, error, 'error');
                    log(connNum, stderr, 'stderror');
                    
                    callback(json);
                });
            
            funcExec        = ClientFuncs[connNum];
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
        pawn(сommand, options, function(error, stdout, stderr) {
            var errorStr = '';
            
            Util.log(error);
            
            if (error)
                errorStr = error.message;
            else if (stderr)
                errorStr = addNewLine(stderr);
            
            errorStr = addNewLine(errorStr);
            
            callback({
                stderr: errorStr,
                stdout: stdout
            });
        });
    }
    
    function onCloudCmd(command, callback) {
        var is;
        
        command = Util.rmStr(command, CLOUDCMD);
        is      = !equalPart(command, ' ');
        
        if (is) {
            Util.exec(callback, HELP);
        } else {
            command = Util.rmStr(command, ' ');
            is  = update && equalPart(command, 'update');
            
            if (is) {
                update.get();
                
                Util.exec(callback, {
                    stdout: addNewLine('update: ok')
                });
            }
            
            is = Util.strCmp(command, 'exit');
            
            if (is)
                process.exit();
        }
        
        return is;
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
            isHome          = paramDir.match(regExpHome) && !WIN,
            isRoot          = paramDir.match(regExpRoot),
            
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
    
    function log(connNum, str, typeParam) {
        var ret, 
            type       = ' ';
        
        if (str) {
            
            if (typeParam)
                type  += typeParam + ':';
            
            ret        = 'client #' + connNum + type + str;
            
            Util.log(ret);
        }
        
        return ret;
    }
})();
