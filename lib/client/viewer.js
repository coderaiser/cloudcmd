var CloudCmd, Util, DOM, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    var KeyBinding                      = CloudCmd.KeyBinding,
        FancyBox                        = {},
        
        Config = {
            beforeShow  : function(){
                DOM.Images.hideLoad();
                KeyBinding.unSet();
            },
            
            afterShow   : function(){
                var lEditor = DOM.getById('CloudViewer');
                if(lEditor)
                    lEditor.focus();
            },
            
            beforeClose : Util.retFunc( KeyBinding.set ),
            
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
    
    CloudCmd.Viewer                     = {
        get: function(){
            return this.FancyBox;
        }
    };
    
    /**
     * function loads css and js of FancyBox
     * @pParent     - this
     * @pCallBack   -  executes, when everything loaded
     */
    FancyBox.load                       = function(pCallBack){
        Util.time('fancybox load');
        var lDir    = CloudCmd.LIBDIRCLIENT + 'viewer/fancyBox/source/',
            lFiles  = [ lDir + 'jquery.fancybox.css',
                        lDir + 'jquery.fancybox.js' ];
        
        DOM.anyLoadOnLoad([lFiles], function(){
            Util.timeEnd('fancybox load');
            Util.exec( pCallBack );
        })
        .cssSet({id:'viewer',
            inner : '#CloudViewer{'                         +
                        'font-size: 16px;'                  +
                        'white-space :pre'                  +
                    '}'                                     +
                    '#CloudViewer::selection{'              +
                        /*
                            'background: #fe57a1;'
                            'color: #fff;'
                        */
                        'background: #b3d4fc;'              +
                        'text-shadow: none;'                +
                    '}'
        });
        
    };
    
    
    FancyBox.showHelp                   = function(){
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
    FancyBox.show                       = function(pCallBack){
        var lPath = CloudFunc.FS + DOM.getCurrentPath();
        
        if( Util.checkExtension(lPath, ['png','jpg', 'gif','ico']) )
            $.fancybox.open({ href : lPath }, Config);
        else
           DOM.getCurrentData(function(pParams){
                $.fancybox('<div id=CloudViewer tabindex=0>' +
                    pParams.data + '</div>', Config);
            });
        
        Util.exec(pCallBack);
    };
    
    CloudCmd.Viewer.init                = function(pCallBack){
        Util.loadOnLoad([
            pCallBack,
            FancyBox.show,
            FancyBox.load,
            DOM.jqueryLoad
        ]);
        
        var lView = function(){
            DOM.Images.showLoad();
            FancyBox.show( DOM.getCurrentFile() );
        };
        
        var lKeyListener = function(pEvent){
            var lKEY        = CloudCmd.KEY,
                lF3         = lKEY.F3,
                lKeyBinded  = KeyBinding.get(),
                lKeyCode    = pEvent.keyCode,
                lShift      = pEvent.shiftKey;
            
            /* если клавиши можно обрабатывать */
            if( lKeyBinded){
                switch(lKeyCode){
                    case lF3:
                        if(lShift){
                            lView();
                            DOM.preventDefault(pEvent);
                        }
                    break;
                
                    case lKEY.F1:
                        FancyBox.showHelp();
                        break;
                }
            }
        };
        
        /* добавляем обработчик клавишь */
        DOM .addKeyListener(lKeyListener)
            .setButtonKey('f3', lView);
    };
    
    CloudCmd.Viewer.FancyBox            = FancyBox;

})(CloudCmd, Util, DOM, CloudFunc);