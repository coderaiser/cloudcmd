var CloudCmd, Util, join, DOM, CloudFunc, Console;

(function(CloudCmd, Util, join, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Konsole = ConsoleProto;
        
    function ConsoleProto() {
        var Name    = 'Konsole',
            Element,
            
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
                show,
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
        
        function show(callback) {
            CloudCmd.View.show(Element, {
                afterShow: function() {
                    Console.focus();
                    Util.exec(callback);
                }
            });
        }
        
        function load(callback) {
            DOM.load.js('/console/console.js', function(error) {
                if (error) {
                    Dialog.alert(error.message);
                    Konsole.show   = init;
                } else {
                    Util.timeEnd(Name + ' load');
                    Util.exec(callback);
                    Konsole.show   = show;
                }
            });
            
            Util.time(Name + ' load');
        }
        
        init();
    }
    
})(CloudCmd, Util, join, DOM, CloudFunc);
