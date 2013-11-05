var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.View = new ViewProto(CloudCmd, Util, DOM, CloudFunc);
        
    function ViewProto(CloudCmd, Util, DOM, CloudFunc){
        var Name    = 'View',
            Loading = false,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            View    = this,
            Element,
            
            Config      = {
                beforeShow      : function(){
                    Images.hideLoad();
                    Key.unsetBind();
                },
                afterShow       : function(){
                    Element.focus();
                },
                
                beforeClose     : Key.setBind,
                
                openEffect      : 'none',
                closeEffect     : 'none',
                autoSize        : false,
                height          : window.innerHeight,
                width           : window.innerWidth/0.75,
                minWidth        : 0,
                minHeight       : 0,
                
                helpers : {
                    overlay : {
                        css : {
                            'background'  : 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                padding : 0
            };
        
        this.init                = function(pCallBack) {
            var lFunc, lIsFunc, lIsCallBack;
            
            Loading = true;
            if (pCallBack){
                lIsFunc     = Util.isFunction(pCallBack);
                lIsCallBack = Util.isFunction(pCallBack.callback);
            }
            
            if (lIsFunc)
                lFunc = pCallBack;
            else if (lIsCallBack)
                lFunc = pCallBack.callback;
            
            Util.loadOnLoad([
                lFunc || Util.retExec(View.show, null),
                load,
                DOM.jqueryLoad
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f3', view);
            
            delete View.init;
        };
        
        /**
         * function shows FancyBox
         */
        this.show                       = function(pData, pCallBack, pConfig) {
            var lPath, lElement, lAfterFunc, lFunc, name,
                config = {};
            
            if (!Loading) {
                Element         = $('<div id=view tabindex=0>');
                if (pData) {
                    lElement    = $(Element).append(pData);
                    lAfterFunc  = Config.afterShow,
                    lFunc       = function(){
                        Util.exec(lAfterFunc);
                        Util.exec(pCallBack);
                    };
                    
                    Config.afterShow = lFunc;
                    
                    Util.copyObj(Config, config);
                    
                    for (name in pConfig)
                        config[name] = pConfig[name];
                    
                    $.fancybox(lElement, config);
                    
                } else {
                    lPath = CloudFunc.FS + DOM.getCurrentPath();
                    if( Util.checkExtension(lPath, ['png','jpg', 'gif','ico']) ) {
                        $.fancybox.open({ href : lPath }, Config);
                    }
                    else
                        DOM.getCurrentData(function(pParams){
                            var data = document.createTextNode(pParams.data);
                            $.fancybox( Element.append(data), Config );
                        });
                }
            }
        };
        
        this.hide                       =  function() {
            $.fancybox.close();
        };
        
        /**
         * function loads css and js of FancyBox
         * @pParent     - this
         * @pCallBack   -  executes, when everything loaded
         */
        function load(pCallBack) {
            Util.time(Name + ' load');
            var lDir    = CloudCmd.LIBDIRCLIENT + 'view/fancyBox/source/',
                lFiles  = [ lDir + 'jquery.fancybox.css',
                            lDir + 'jquery.fancybox.js' ];
            
            DOM.anyLoadOnLoad([lFiles], function(){
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec( pCallBack );
                Images.hideLoad();
            })
            .cssSet({id:'view-css',
                inner : '#view{'                                +
                            'font-size: 16px;'                  +
                            'white-space :pre;'                 +
                            'outline: 0;'                       +
                        '}'                                     +
                        '#view::selection{'                     +
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
                        '}'
            });
            
        }
        
        function view() {
            Images.showLoad();
            View.show();
        }
        
        function listener(pEvent) {
            var lF3         = Key.F3,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            /* если клавиши можно обрабатывать */
            if (lIsBind && lKey === lF3) {
                view();
                DOM.preventDefault(pEvent);
            }
        }
    }

})(CloudCmd, Util, DOM, CloudFunc);