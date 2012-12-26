var CloudCommander, Util, DOM, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        KeyBinding                      = CloudCommander.KeyBinding,
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
    
    cloudcmd.Viewer                     = {
        get: (function(){
            return this.FancyBox;
        })
    };
    
    /**
     * function loads css and js of FancyBox
     * @pParent     - this
     * @pCallBack   -  executes, when everything loaded
     */
    FancyBox.load                       = function(pCallBack){
        console.time('fancybox load');
        var lDir    = cloudcmd.LIBDIRCLIENT + 'viewer/fancybox/',
            lFiles  = [ lDir + 'jquery.fancybox.css',
                        lDir + 'jquery.fancybox.js' ];
                
        DOM.anyLoadOnLoad([lFiles], function(){
            console.timeEnd('fancybox load');
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
    
    
    /**
     * function shows FancyBox
     */
    FancyBox.show                       = function(){
        var lPath = DOM.getCurrentPath();
        
        if( Util.checkExtension(lPath, ['png','jpg', 'gif','ico']) )
            $.fancybox.open({ href : lPath }, Config);
        else
           DOM.getCurrentData(function(pParams){
                $.fancybox('<div id=CloudViewer tabindex=0>' +
                    pParams.data + '</div>', Config);
            });
    };
    
    cloudcmd.Viewer.init                = function(){
        Util.loadOnLoad([
            FancyBox.show,
            FancyBox.load,
            DOM.jqueryLoad
        ]);
        
        var lView = function(){
            DOM.Images.showLoad();
            FancyBox.show( DOM.getCurrentFile() );
        };
        
        var lKeyListener = function(pEvent){
            var lF3         = cloudcmd.KEY.F3,
                lKeyBinded  = KeyBinding.get(),
                lKey        = pEvent.keyCode,
                lShift      = pEvent.shiftKey;
            
            /* если клавиши можно обрабатывать */
            if( lKeyBinded && lKey === lF3 && lShift ){
                lView();
                pEvent.preventDefault();
            }
        };        
        
        /* добавляем обработчик клавишь */
        DOM.addKeyListener(lKeyListener)
            .setButtonKey('f3', lView);
    };
    
    cloudcmd.Viewer.FancyBox            = FancyBox;
})();