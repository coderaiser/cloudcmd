/* global CloudCmd */
/* global Util */
/* global DOM */
/* global CloudFunc */
/* global rendy */
/* global spero */

(function(CloudCmd, Util, DOM, CloudFunc, rendy) {
    'use strict';
    
    CloudCmd.Operation = OperationProto;
        
    function OperationProto(operation, data) {
        var Name        = 'Operation',
            Loaded,
            copyFn      = DOM.RESTful.cp,
            moveFn      = DOM.RESTful.mv,
            Images      = DOM.Images,
            Dialog      = DOM.Dialog,
            
            Operation   = this;
            
        function init() {
            Images.show.load();
            
            Util.exec.series([
                function(callback) {
                    var Files = DOM.Files;
                    
                    Files.get('config', function(error, config) {
                        if (error)
                            alert(error);
                        else if (config.progressOfCopying)
                            load(function() {
                                create(callback);
                            });
                        else
                            callback();
                    });
                },
                function() {
                    Loaded = true;
                    Images.hide();
                    Operation.show(operation, data);
                }
            ]);
        }
        
        function create(callback) {
            spero(function() {
                var parse   = function(fn) {
                    return function(data, callback) {
                        var listeners = {
                            progress: function(value) {
                                Images.setProgress(value);
                            },
                            
                            end: function() {
                                callback();
                                events.forEach(function(name) {
                                    spero.removeListener(name, listeners[name]);
                                });
                            },
                            
                            error: function(data) {
                                var msg = data + '\n Continue?',
                                    is = confirm(msg);
                                
                                if (is)
                                    spero.continue();
                                else
                                    spero.abort();
                            }
                        },
                        events = Object.keys(listeners);
                        
                        Images.show('top');
                        
                        fn(data.from, data.to, data.names);
                        
                        events.forEach(function(name) {
                            spero.on(name, listeners[name]);
                        });
                    };
                };
                
                spero.on('connect', function() {
                    copyFn      = parse(spero.copy);
                });
                
                spero.on('disconnect', function() {
                    copyFn      = DOM.RESTful.cp;
                });
                
                Util.exec(callback);
            });
        }
        
        this.hide   = function() {
            CloudCmd.View.hide();
        };
        
        this.show = function(operation, data) {
            if (Loaded)
                switch(operation) {
                case 'copy':
                    this.copy(data);
                    break;
                
                case 'move':
                    this.move(data);
                    break;
                }
        };
        
        this.copy = function(data) {
            processFiles(data, copyFn, message('Copy'));
        };
        
        this.move = function(data) {
            processFiles(data, moveFn, message('Rename/Move'));
        };
        
        /*
         * process files (copy or move)
         * @param data
         * @param operation
         */
        function processFiles(data, operation, message) {
             var name, files,
                CurrentInfo = DOM.CurrentInfo,
                panel,
                shouldAsk,
                sameName,
                ok,
                tmpl        = '"{{ name }}" already exist. Overwrite?',
                
                from        = '',
                to          = '',
                
                names       = [];
            
            if (data) {
                from        = data.from;
                to          = data.to;
                names       = data.names;
                panel       = CurrentInfo.panel;
            } else {
                from        = CurrentInfo.dirPath;
                to          = DOM.getNotCurrentDirPath();
                names       = DOM.getSelectedNames();
                data        = {};
                shouldAsk   = true;
                panel       = CurrentInfo.panelPassive;
            }
            
            if (!names.length)
                names.push(DOM.getCurrentName());
            
            name    = names[0];
            
            sameName    = !!DOM.getCurrentByName(name, panel);
            
            if (name === '..') {
                Dialog.alert('No files selected!');
            } else {
                if (shouldAsk)
                    to = message(to, names);
                
                ok = from !== to && to;
                
                if (ok && shouldAsk && sameName)
                    ok = Dialog.confirm(rendy(tmpl, {
                        name: name
                    }));
                
                if (ok) {
                    Images.show.load('top');
                     
                    files   = {
                        from    : from,
                        to      : to,
                        names   : names
                    };
                    
                    operation(files, function() {
                        var path            = CloudFunc.rmLastSlash(from);
                        
                        DOM.Storage.remove(path, function() {
                            var panel           = CurrentInfo.panel,
                                panelPassive    = CurrentInfo.panelPassive,
                                setCurrent      = function() {
                                    var current;
                                    
                                    if (!name)
                                        name = data.names[0];
                                    
                                    current = DOM.getCurrentByName(name);
                                    DOM.setCurrentFile(current);
                                };
                            
                            if (!CurrentInfo.isOnePanel)
                                CloudCmd.refresh(panelPassive, {noCurrent: true}, function() {});
                            
                            CloudCmd.refresh(panel, setCurrent);
                        });
                    });
                }
            }
        }
        
        function message(msg) {
            return function(to, names) {
                var ret,
                    n       = names.length,
                    name    = names[0];
                
                msg += ' ';
                
                if (names.length > 1)
                    msg     += n + ' file(s)';
                else
                    msg     += '"' + name + '"';
                
                msg         += ' to';
                
                ret = Dialog.prompt(msg, to);
                
                return ret;
            };
        }
        
        function load(callback) {
            DOM.load.js('/spero/spero.js', function(error) {
                if (error) {
                    Dialog.alert(error.message);
                } else {
                    Loaded = true;
                    Util.timeEnd(Name + ' load');
                    Util.exec(callback);
                }
            });
            
            Util.time(Name + ' load');
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM, CloudFunc, rendy);
