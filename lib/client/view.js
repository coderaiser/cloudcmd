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
        
        function init() {
            var lFunc, lIsFunc, lIsCallBack;
            
            Loading = true;
            
            if (CallBack) {
                lIsFunc     = Util.isFunction(CallBack);
                lIsCallBack = Util.isFunction(CallBack.callback);
            }
            
            if (lIsFunc)
                lFunc = CallBack;
            else if (lIsCallBack)
                lFunc = CallBack.callback;
            else
                lFunc = Util.retExec(View.show, null);
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                load,
                lFunc
            ]);
            
            Events.addKey(listener);
        }
        
        /**
         * function shows FancyBox
         */
        function show(pData, pCallBack, pConfig) {
            var lPath, lElement, lAfterFunc, lFunc, name, isImage,
                config = {};
            
            if (!Loading) {
                Element         = $('<div id=view tabindex=0>');
                if (pData) {
                    lElement    = $(Element).append(pData);
                    lFunc       = function() {
                        Util.exec(pCallBack);
                    };
                    
                    Config.afterShow = lFunc;
                    
                    Util.copyObj(Config, config);
                    
                    for (name in pConfig)
                        config[name] = pConfig[name];
                    
                    $.fancybox(lElement, config);
                    
                } else {
                    lPath   = CloudFunc.FS + Info.path;
                    isImage = $.fancybox.isImage(lPath);
                    
                    if (isImage) {
                        $.fancybox.open({ href : lPath }, Config);
                    } else
                        Info.getData(function(pParams) {
                            var data = document.createTextNode(pParams.data);
                            /* add margin only for view text documents */
                            Element.css('margin', '2%');

                            $.fancybox(Element.append(data), Config);
                        });
                }
            }
        }
        
        function hide() {
            $.fancybox.close();
        }
        
        /**
         * function loads css and js of FancyBox
         * @pCallBack   -  executes, when everything loaded
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
