var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Markdown = MarkdownProto;
        
    function MarkdownProto(nameParam, optionsParam) {
        var Images      = DOM.Images,
            RESTful     = DOM.RESTful,
            Markdown    = RESTful.Markdown,
            MD          = this;
            
        function init() {
            Images.showLoad({
                top:true
            });
            
            Util.loadOnLoad([
                CloudCmd.View,
                Util.bind(MD.show, null, null),
            ]);
        }
        
        this.show                       = function(name, options) {
            var o               = options,
                relativeQuery   = '?relative';
            
            if (!name)
                name            = nameParam;
            
            if (!options)
                o               = 
                options         = optionsParam;
            
            if (options) {
                Images.showLoad({
                    top: o.topLoad
                });
                
                if (o.relative)
                    name += relativeQuery;
            }
            
            Markdown.read(name, function(result) {
                var div = DOM.anyload({
                        name        : 'div',
                        className   : 'help',
                        inner       : result
                    });
                
                Images.hideLoad();
                
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
