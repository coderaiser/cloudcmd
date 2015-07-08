var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Markdown = MarkdownProto;
        
    function MarkdownProto(nameParam, optionsParam) {
        var Images      = DOM.Images,
            RESTful     = DOM.RESTful,
            Markdown    = RESTful.Markdown,
            MD          = this;
            
        function init() {
            Images.show.load('top');
            
            Util.exec.series([
                CloudCmd.View,
                Util.exec.with(MD.show, null, null),
            ]);
        }
        
        this.show                       = function(name, options) {
            var o               = options || optionsParam || {},
                relativeQuery   = '?relative';
            
            if (!name)
                name            = nameParam;
            
            Images.show.load(o.positionLoad);
            
            if (o.relative)
                name += relativeQuery;
            
            Markdown.read(name, function(error, result) {
                var div = DOM.load({
                        name        : 'div',
                        className   : 'help',
                        inner       : result
                    });
                
                Images.hide();
                
                CloudCmd.View.show(div);
                
                nameParam       =
                optionsParam    = null;
            });
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
