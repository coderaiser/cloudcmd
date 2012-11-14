var CloudCommander, Util, DOM, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        KeyBinding                      = CloudCommander.KeyBinding,
        FancyBox                        = {};
    
    cloudcmd.Viewer                     = {
        get: (function(){
            return this.FancyBox;
        })
    };
    
    cloudcmd.Viewer.dir                 = './lib/client/viewer/';
    FancyBox.dir                        = cloudcmd.Viewer.dir + 'fancybox/';
    
    /* PRIVATE FUNCTIONS */
    
    function set(){
        if(DOM.getByClass('fancybox').length)
            return;
        Util.tryCatchLog(function(){
            /* get current panel (left or right) */
            var lPanel = DOM.getPanel(),
                    
                /* get all file links */
                lA = DOM.getByTag('a', lPanel),
                        
                lDblClick_f = function(pA){
                    return function(){
                        var lConfig  = FancyBox.getConfig();
                        lConfig.href = pA.href;
                        if(pA.rel)
                            $.fancybox(lConfig);
                        else
                            FancyBox.loadData(pA, FancyBox.onDataLoaded);
                    };
            };
            
            /* first two is not files nor folders*/
            for (var i = 2, n = lA.length; i < n; i++) {
                var lName = lA[i].title || lA[i].textContent;
                
                lA[i].className = 'fancybox';
                if(CloudFunc.checkExtension(lName, ['png','jpg', 'gif','ico']))
                    lA[i].rel   = 'gallery';
                
                lA[i].ondblclick = lDblClick_f(lA[i]);
            }
        });
    }
    
    
    
    /**
     * function return configureation for FancyBox open and
     * onclick (it shoud be different objects)
     */
    FancyBox.getConfig                  = function(){
        return{
            /* function do her work
             * before FauncyBox shows
             */
            beforeShow  : function(){
                KeyBinding.unSet();
            },
            
            afterShow   : function(){
                var lEditor = DOM.getById('CloudViewer');
                if(lEditor)            
                    lEditor.focus();
            },
            
            beforeClose : function(){
                KeyBinding.set();
            },
            
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
    };
    
    /**
     * function loads css and js of FancyBox
     * @pParent     - this
     * @pCallBack   -  executes, when everything loaded
     */
    FancyBox.load                       = function(pCallBack){
        console.time('fancybox load');
        var lDir = FancyBox.dir;
        
        DOM.anyLoadOnLoad([
            lDir + 'jquery.fancybox.css',
            lDir + 'jquery.fancybox.js'],
            
            function(){
                console.timeEnd('fancybox load');
                pCallBack();
            });
        
        DOM.cssSet({id:'viewer',
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
     * function loads data an put it to pSuccess_f
     * @param pA          - link to data
     * @param pSucces_f   - function, thet process data (@data)
     * 
     * Example: loadData('index.html', function(pData){console.log(pData)});
     */
    FancyBox.loadData                   = function(pA, pSuccess_f){
        var lLink = pA.href;
                        
        /* убираем адрес хоста */
        lLink = lLink.replace(cloudcmd.HOST, '');
        
        if (lLink.indexOf(CloudFunc.NOJS) === CloudFunc.FS.length)
            lLink = lLink.replace(CloudFunc.NOJS, '');
        
        DOM.ajax({
            url     : lLink,
            error  : Util.bind(function(jqXHR, textStatus, errorThrown){
                this.loading             = false; 
                return DOM.Images.showError(jqXHR, textStatus, errorThrown);
            }, this),
            
            success:function(data, textStatus, jqXHR){                    
               if(typeof pSuccess_f === 'function')
                    pSuccess_f(data);
                                              
                DOM.Images.hideLoad();
            }
        });
    };
    
    FancyBox.onDataLoaded               = function(pData){
        var lConfig = FancyBox.getConfig();
        
        /* if we got json - show it */
        if(typeof pData === 'object')
            pData = JSON.stringify(pData, null, 4);
            
        $.fancybox('<div id=CloudViewer tabindex=0>' + pData + '</div>', lConfig);
    };
    
    /**
     * function shows FancyBox
     */
    FancyBox.show                       = function(pCallBack){
        set();
                
        var lConfig = FancyBox.getConfig(),
            lResult = Util.exec(pCallBack);
        if(!lResult){
            var lCurrentFile = DOM.getCurrentFile(),
                lA = DOM.getByClass('fancybox', lCurrentFile)[0];
            
            if(lA){
                if(lA.rel)
                    $.fancybox.open({ href : lA.href },
                        lConfig);
                else FancyBox.loadData(lA, FancyBox.onDataLoaded);
            }
        }
        
        DOM.Images.hideLoad();
    };
    
    cloudcmd.Viewer.Keys                = function(){
        DOM.jqueryLoad( Util.retLoadOnLoad([
            FancyBox.show,
            FancyBox.load
        ]));
        
        var lView = function(){
            DOM.Images.showLoad();
            FancyBox.show( DOM.getCurrentFile() );
        };
        
        var lKeyListener = function(){
            var lF3         = cloudcmd.KEY.F3,
                lKeyBinded  = KeyBinding.get(),
                lKey        = event.keyCode,
                lShift      =   event.shiftKey;
            
            /* если клавиши можно обрабатывать */
            if( lKeyBinded && lKey === lF3 && lShift ){
                lView();
                event.preventDefault();
            }
        };        
        
        /* добавляем обработчик клавишь */
        DOM.addKeyListener(lKeyListener);
        
        DOM.setButtonKey('f3', lView);
    };
    
    cloudcmd.Viewer.FancyBox            = FancyBox;
})();