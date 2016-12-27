var CloudCmd, Util, DOM, CloudFunc;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Edit = EditProto;
    
    function EditProto(callback) {
        var Name = 'Edit';
        var Loading = true;
        
        var Dialog      = DOM.Dialog,
            exec        = Util.exec,
            Element,
            
            EditorName = 'edward',
            editor,
            
            TITLE = 'Edit',
            
            ConfigView  = {
                afterShow: function() {
                    editor
                        .moveCursorTo(0, 0)
                        .focus();
                }
            };
        
        function init(callback) {
            var element = createElement();
            
            exec.series([
                CloudCmd.View,
                getConfig,
                function(callback) {
                    loadFiles(element, callback);
                },
            ], callback);
        }
        
        function createElement() {
            var element = DOM.load({
                name: 'div',
                style:
                    'width      : 100%;'                +
                    'height     : 100%;'                +
                    'font-family: "Droid Sans Mono";'   +
                    'position   : absolute;',
                notAppend: true
            });
            
            Element = element;
            
            return element;
        }
        
        function checkFn(name, fn) {
            if (typeof fn !== 'function')
                throw Error(name + ' should be a function!');
        }
        
        function initConfig(config, options) {
            Util.copyObj(config, ConfigView);
            
            if (!options)
                return config;
            
            if (options.afterShow) {
                checkFn('options.afterShow', options.afterShow);
                
                var afterShow = config.afterShow;
                
                config.afterShow = function() {
                    afterShow();
                    options.afterShow();
                };
            }
            
            return config;
        }
        
        this.show = function(options) {
            if (Loading)
                return;
             
            CloudCmd.View.show(Element, initConfig(options));
        };
        
        this.getEditor = function() {
            return editor;
        };
        
        this.getElement = function() {
            return Element;
        };
        
        this.hide = function() {
            CloudCmd.View.hide();
        };
        
        function getConfig(callback) {
            DOM.Files.get('config', function(error, config) {
                if (error)
                    Dialog.alert(TITLE, error);
                else if (config.editor)
                    EditorName = config.editor;
                
                callback();
            });
        }
        
        function loadFiles(element, callback) {
            var prefix = CloudCmd.PREFIX;
            var prefixName = prefix + '/' + EditorName;
            var url = prefixName + '/' + EditorName + '.js';
            
            Util.time(Name + ' load');
            
            DOM.load.js(url, function() {
                var word = window[EditorName];
                var options = {
                    maxSize     : CloudFunc.MAX_FILE_SIZE,
                    prefix      : prefixName,
                    socketPath  : prefix
                };
                
                word(element, options, function(ed) {
                    Util.timeEnd(Name + ' load');
                    editor  = ed;
                    Loading = false;
                    
                    exec(callback);
                });
            });
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM, CloudFunc);

