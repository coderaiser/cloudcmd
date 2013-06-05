var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.View = new ViewProto(CloudCmd, Util, DOM, CloudFunc);
        
    function ViewProto(CloudCmd, Util, DOM, CloudFunc){
        var Key         = CloudCmd.Key,
            FancyBox    = this,
            
            Config      = {
                beforeShow  : function(){
                    DOM.Images.hideLoad();
                    Key.unsetBind();
                },
                
                afterShow   : function(){
                    var lEditor = DOM.getById('View');
                    if(lEditor)
                        lEditor.focus();
                },
                
                beforeClose : Util.retFunc( Key.setBind ),
                
                openEffect      : 'none',
                closeEffect     : 'none',
                autoSize        : false,
                height          : window.innerHeight,
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
            Util.loadOnLoad([
                pCallBack,
                FancyBox.show,
                load,
                DOM.jqueryLoad
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f3', view);
        };
        
        this.showHelp                   = function(){
            DOM.Images.showLoad();
            DOM.ajax({
                url: '/README.md', 
                success:  function (pData){
                    var lData = {text: pData};
                    DOM.ajax({
                        method  : 'post',
                        url     : 'https://api.github.com/markdown',
                        data    : Util.stringifyJSON(lData),
                        success:function(pResult){
                            DOM.Images.hideLoad();
                            $.fancybox(pResult, Config);
                        },
                    
                        error: DOM.Images.showError
                    });
                },
                
                error:DOM.Images.showError
            });
        };
        
        /**
         * function shows FancyBox
         */
        this.show                       = function(pCallBack){
            var lPath = CloudFunc.FS + DOM.getCurrentPath();
            
            if( Util.checkExtension(lPath, ['png','jpg', 'gif','ico']) )
                $.fancybox.open({ href : lPath }, Config);
            else
               DOM.getCurrentData(function(pParams){
                    $.fancybox('<div id=view tabindex=0>' +
                        pParams.data + '</div>', Config);
                });
            
            Util.exec(pCallBack);
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
            })
            .cssSet({id:'view-css',
                inner : '#view{'                         +
                            'font-size: 16px;'                  +
                            'white-space :pre'                  +
                        '}'                                     +
                        '#view::selection{'              +
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
                DOM.Images.showLoad();
                FancyBox.show( DOM.getCurrentFile() );
            }
            
        function listener(pEvent){
            var lF3         = Key.F3,
                lF1         = Key.F1,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            /* если клавиши можно обрабатывать */
            if (lIsBind) {
                switch(lKey){
                    case lF3:
                        view();
                        DOM.preventDefault(pEvent);
                        break;
                    
                    case lF1:
                        FancyBox.showHelp();
                        break;
                }
            }
        }
    }

})(CloudCmd, Util, DOM, CloudFunc);
