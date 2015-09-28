/* global CloudCmd */
/* global Util */
/* global DOM */
/* global Console */

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Konsole = ConsoleProto;
        
    function ConsoleProto() {
        var Name    = 'Konsole',
            TITLE   = 'Console',
            
            Element,
            Loaded,
            Images  = DOM.Images,
            Dialog  = DOM.Dialog,
            
            Konsole = this;
            
        function init() {
            Images.show.load('top');
            
            Util.exec.series([
                CloudCmd.View,
                load,
                create,
                Konsole.show,
            ]);
            
            Element         = DOM.load({
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
        
        function create(callback) {
            var prefix = getPrefix();
            
            Console(Element, prefix, function() {
                Util.exec(callback);
            });
            
            Console.addShortCuts({
                'P': function() {
                    var command = Console.getPromptText(),
                        path    = DOM.getCurrentDirPath();
                    
                    command     += path;
                    Console.setPromptText(command);
                }
            });
        }
        
        this.show = function(callback) {
            if (Loaded)
                CloudCmd.View.show(Element, {
                    afterShow: function() {
                        Console.focus();
                        Util.exec(callback);
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
                    Util.exec(callback);
                }
            });
            
            Util.time(Name + ' load');
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);
