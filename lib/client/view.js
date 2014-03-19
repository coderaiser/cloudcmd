var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.View = ViewProto;
        
    function ViewProto(CallBack) {
        var Name    = 'View',
            Loading = false,
            Events  = DOM.Events,
            Info    = DOM.CurrentInfo,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            View    = Util.exec.bind(Util),
            Element,
            
            Config      = {
                beforeShow      : function() {
                    Images.hideLoad();
                    Key.unsetBind();
                },
                beforeClose     : Key.setBind,
                loop            : false,
                openEffect      : 'none',
                closeEffect     : 'none',
                autoSize        : false,
                height          : '100%',
                width           : '100%',
                minWidth        : 0,
                minHeight       : 0,
                padding : 0
            };
        
        View.show   = show;
        View.hide   = hide;
        View.rmKeys = rmKeys;
        
        function rmKeys() {
            /* remove default key binding 
             * which is ruin terminal
             */
            $.fancybox.defaults.keys = null;
        }
        
        function init() {
            var func = CallBack || Util.bind(show, null);
            
            Loading = true;
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                load,
                func
            ]);
            
            Events.addKey(listener);
        }
        
        /**
         * function shows FancyBox
         */
        function show(data, callback, newConfig) {
            var path, element, func, name, isImage,
                config = {};
            
            if (!Loading) {
                Element         = $('<div id=view tabindex=0>');
                
                if (data) {
                    element    = $(Element).append(data);
                    func       = Util.retExec(callback);
                    
                    Config.afterShow = func;
                    
                    Util.copyObj(config, Config);
                    
                    for (name in newConfig)
                        config[name] = newConfig[name];
                    
                    $.fancybox(element, config);
                    
                } else {
                    Images.showLoad();
                    path   = CloudFunc.FS + Info.path;
                    isImage = $.fancybox.isImage(path);
                    
                    if (isImage) {
                        $.fancybox.open({ href : path }, Config);
                    } else
                        Info.getData(function(data) {
                            var element = document.createTextNode(data);
                            /* add margin only for view text documents */
                            Element.css('margin', '2%');
                            
                            $.fancybox(Element.append(element), Config);
                        });
                }
            }
        }
        
        function hide() {
            $.fancybox.close();
        }
        
        /**
         * function loads css and js of FancyBox
         * @callback   -  executes, when everything loaded
         */
        function load(callback) {
            var dir    = CloudCmd.LIBDIRCLIENT + 'view/fancyBox/source/',
                files  = [
                    dir + 'jquery.fancybox.css',
                    dir + 'jquery.fancybox.js'
                ];
            
            Util.time(Name + ' load');
            
            DOM.anyLoadOnLoad([files], function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(callback);
                Images.hideLoad();
            })
            .cssSet({id:'view-css',
                inner : '#view {'                               +
                            'font-size: 16px;'                  +
                            'white-space :pre;'                 +
                            'outline: 0;'                       +
                        '}'                                     +
                        '#view::selection {'                    +
                            /*
                                'background: #fe57a1;'
                                'color: #fff;'
                            */
                            'background: #b3d4fc;'              +
                            'text-shadow: none;'                +
                        '}'                                     +
                        '#fancybox-loading div {'               +
                            'background: none;'                 +
                            'width: 0;'                         +
                            'height: 0'                         +
                        '}'                                     +
                        '.fancybox-overlay {'                   +
                            'background: rgba(255, 255, 255, 0.1)' +
                        '}'                                     +
                        '.fancybox-lock .fancybox-overlay {'    +
                            'overflow-y: hidden'                +
                        '}'
            });
            
        }
        
        function view() {
            Images.showLoad();
            View.show();
        }
        
        function listener(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                hide();
        }
        
        
        init();
        
        return View;
    }

})(CloudCmd, Util, DOM, CloudFunc);
