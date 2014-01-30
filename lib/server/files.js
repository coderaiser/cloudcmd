(function(object) {
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# files.js'                                        + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for reading a couple files.'                + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        path        = main.path,
        pipe        = main.pipe,
        CloudFunc   = main.cloudfunc,
        Util        = main.util;
    
    object.read     = function(pFiles, pOptions, pCallBack) {
        var lDone = [],
            lFiles,
            lErrors,
            i, n,
            lName,
            lReadedFiles = {},
            lDoneFunc = function (pParams) {
                var msg, status, p, lName,
                    lRet =  Util.checkObj(pParams, ['error', 'data', 'params']);
                
                if (lRet) {
                    lDone.pop();
                    p       = pParams,
                    lName   = p.params;
                    
                    if (p.error) {
                        status = 'error';
                        
                        if (!lErrors)
                            lErrors = {};
                        
                        lErrors[lName] = p.error;
                    }
                    else {
                        status = 'ok';
                        lReadedFiles[lName] = p.data;
                    }
                    
                    lName   = path.basename(lName);
                    msg     = CloudFunc.formatMsg('read', lName, status);
                    
                    Util.log(msg);
                    
                    if (!lDone.length)
                        Util.exec(pCallBack, lErrors, lReadedFiles);
                }
            };
        
        if (Util.isFunction(pOptions)) {
            pCallBack   = pOptions;
            pOptions    = null;
        }
        
        if (Util.isArray(pFiles))
            lFiles = pFiles;
        else
            lFiles = [pFiles];
        
        for (i = 0, n = lFiles.length; i < n; i++) {
            lName = lFiles.pop();
            lDone.push(lName);
            
            fs.readFile(lName, pOptions, Util.call(lDoneFunc, lName));
        }
    };
    
    object.readPipe     = readPipe;
    
    function readPipe(params) {
        var name, 
            p       = params,
            length  = p.names && p.names.length;
        
        if (!length) {
            p.write.end();
            Util.exec(p.callback);
        } else {
            name = p.dir + p.names.shift();
            
            pipe.create({
                from    : name,
                write   : p.write,
                gzip    : p.gzip,
                notEnd  : true,
                callback: function(error) {
                    if (error)
                        Util.exec(p.callback, error);
                    else
                        readPipe(params);
                }
            });
        }
    }
    
})(this);
