var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.View = new ViewProto(CloudCmd, Util, DOM, CloudFunc);
        
    function ViewProto(CloudCmd, Util, DOM, CloudFunc){
        var Key     = CloudCmd.Key,
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
                
                helpers : {
                    overlay : {
                        css : {
                            'background'  : 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                padding : 0
            };
        
        this.init                = function(pCallBack){
            var lFunc, lIsFunc = Util.isFunction(pCallBack);
            
            if (lIsFunc)
                lFunc = pCallBack;
            
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
        this.show                       = function(pData, pCallBack){
            var lPath, lElement,
                lAfterFunc, lFunc;
            
            Element         = $('<div id=view tabindex=0>');
            if (pData) {
                lElement    = $(Element).append(pData);
                lAfterFunc  = Config.afterShow,
                lFunc       = function(){
                    Util.exec(lAfterFunc);
                    Util.exec(pCallBack);
                };
                
                Config.afterShow = lFunc;
                
                $.fancybox(lElement, Config);
                
            } else {
                lPath = CloudFunc.FS + DOM.getCurrentPath();
                if( Util.checkExtension(lPath, ['png','jpg', 'gif','ico']) ) {
                    $.fancybox.open({ href : lPath }, Config);
                }
                else
                    DOM.getCurrentData(function(pParams){
                        $.fancybox( Element.append(pParams.data), Config );
                    });
            }
        };
        
        this.hide                       =  function(){
            $.fancybox.close();
        };
        
        /**
         * function loads css and js of FancyBox
         * @pParent     - this
         * @pCallBack   -  executes, when everything loaded
         */
        function load(pCallBack){
            Util.time('fancybox load');
            var lDir    = CloudCmd.LIBDIRCLIENT + 'view/fancyBox/source/',
                lFiles  = [ lDir + 'jquery.fancybox.css',
                            lDir + 'jquery.fancybox.js' ];
            
            DOM.anyLoadOnLoad([lFiles], function(){
                Util.timeEnd('fancybox load');
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
                        '}'
            });
            
        }
        
        function view(){
            Images.showLoad();
            View.show();
        }
        
        function listener(pEvent){
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