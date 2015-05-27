/* global CloudCmd */
/* global Util */
/* global DOM */ 
/* global CloudFunc */
/* global Console */

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Konsole = ConsoleProto;
        
    function ConsoleProto() {
        var Name    = 'Konsole',
            Element,
            Loaded,
            Images  = DOM.Images,
            Dialog  = DOM.Dialog,
            
            Konsole = this;
            
        function init() {
            Images.show.load('top');
            
            Util.exec.series([
                DOM.loadJquery,
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
        
        function create(callback) {
            Console(Element, function() {
                Util.exec(callback);
            });
            
            Console.addShortCuts({
                'P': function() {
                    var command = Console.getPromptText(),
                        path    = DOM.getCurrentDirPath();
                        
                    path        = CloudFunc.rmLastSlash(path);
                    
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
            DOM.load.js('/console/console.js', function(error) {
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
    
})(CloudCmd, Util, DOM, CloudFunc);
