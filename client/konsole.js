/* global CloudCmd */
/* global Util */
/* global DOM */
/* global Console */
/* global exec */

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Konsole = ConsoleProto;
        
    function ConsoleProto() {
        var config = CloudCmd.config;
        var Name = 'Konsole',
            TITLE   = 'Console',
            
            Element,
            Loaded,
            Images  = DOM.Images,
            Dialog  = DOM.Dialog,
            
            Konsole = this;
            
        function init() {
            Images.show.load('top');
            
            exec.series([
                CloudCmd.View,
                load,
                create,
                Konsole.show,
            ]);
            
            Element = DOM.load({
                name        : 'div',
                className   : 'console'
            });
        }
        
        this.hide   = function() {
            CloudCmd.View.hide();
        };
        
        this.clear  = function() {
            Console.clear();
        };
        
        function getPrefix() {
            return CloudCmd.PREFIX + '/console';
        }
        
        function getEnv() {
            return {
                ACTIVE_DIR: DOM.getCurrentDirPath.bind(DOM),
                PASSIVE_DIR: DOM.getNotCurrentDirPath.bind(DOM),
                CURRENT_NAME: DOM.getCurrentName.bind(DOM),
                CURRENT_PATH: function() {
                    return DOM.CurrentInfo.path;
                }
            };
        }
        
        function create(callback) {
            var options = {
                env: getEnv(),
                prefix: getPrefix(),
                socketPath: CloudCmd.PREFIX,
            };
            
            Console(Element, options, function(spawn) {
                spawn.on('connect', exec.with(authCheck, spawn));
                exec(callback);
            });
            
            Console.addShortCuts({
                'P': function() {
                    var command = Console.getPromptText(),
                        path    = DOM.getCurrentDirPath();
                    
                    command += path;
                    Console.setPromptText(command);
                }
            });
        }
        
        function authCheck(spawn) {
            if (!config('auth'))
                return;
            
            spawn.emit('auth', config('username'), config('password'));
            
            spawn.on('reject', function() {
                Dialog.alert(TITLE, 'Wrong credentials!');
            });
        }
        
        this.show = function(callback) {
            if (Loaded)
                CloudCmd.View.show(Element, {
                    afterShow: function() {
                        Console.focus();
                        exec(callback);
                    }
                });
        };
        
        function load(callback) {
            var prefix  = getPrefix(),
                url     = prefix + '/console.js';
            
            DOM.load.js(url, function(error) {
                if (error) {
                    Dialog.alert(TITLE, error.message);
                } else {
                    Loaded = true;
                    Util.timeEnd(Name + ' load');
                    exec(callback);
                }
            });
            
            Util.time(Name + ' load');
        }
        
        if (!CloudCmd.config('console'))
            return;
        
        init();
    }
    
})(CloudCmd, Util, DOM);
