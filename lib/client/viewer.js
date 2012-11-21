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
        
    /* PRIVATE FUNCTIONS */
    
    function set(){
        if(DOM.getByClass('fancybox').length)
            return;
        
        /* get all file links */
        var lA = DOM.getByTag('a', DOM.getPanel(false) ),
            lActiveA = DOM.getByTag('a', DOM.getPanel(true) ),
                    
            lDblClick_f = function(pA){
                return function(){
                    var lConfig  = getConfig();
                    lConfig.href = pA.href;
                    if(pA.rel)
                        $.fancybox(lConfig);
                    else
                        FancyBox.loadData(pA, FancyBox.onDataLoaded);
                };
            },
        
            lSetOnclick = function(pA){
               /* first two is not files nor folders*/
                for (var i = 2, n = pA.length; i < n; i++) {
                    
                    var lA = pA[i],
                        lName = lA.title || lA.textContent;
                    
                    lA.className = 'fancybox';
                    if(Util.checkExtension(lName, ['png','jpg', 'gif','ico']))
                        lA.rel   = 'gallery';
                    
                    lA.ondblclick = lDblClick_f(lA);
                }
            };
            
            lSetOnclick(lA);
            lSetOnclick(lActiveA);
    }
    
    /**
     * function return configureation for FancyBox open and
     * onclick (it shoud be different objects)
     */
    function getConfig(){
        return{
            /* function do her work
             * before FauncyBox shows
             */
            beforeShow  : Util.retFunc( KeyBinding.unSet ),
            
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
    }
    
    /**
     * function loads css and js of FancyBox
     * @pParent     - this
     * @pCallBack   -  executes, when everything loaded
     */
    FancyBox.load                       = function(pCallBack){
        console.time('fancybox load');
        var lDir = cloudcmd.LIBDIRCLIENT + 'viewer/fancybox/';
        
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
    FancyBox.loadData                   = function(pA, pCallBack){
        var lLink = pA.href;
                        
        /* убираем адрес хоста */
        lLink = lLink.replace(cloudcmd.HOST, '');
        
        if (lLink.indexOf(CloudFunc.NOJS) === CloudFunc.FS.length)
            lLink =  Util.removeStr(lLink, CloudFunc.NOJS);
        
        DOM.ajax({
            url     : lLink,
            
            error   : function(jqXHR, textStatus, errorThrown){
                FancyBox.loading             = false; 
                return DOM.Images.showError(jqXHR, textStatus, errorThrown);
            },
            
            success :function(data, textStatus, jqXHR){
               Util.exec(pCallBack, data);
            }
        });
    };
    
    FancyBox.onDataLoaded               = function(pData){
        var lConfig = getConfig();
        
        /* if we got json - show it */
        if( Util.isObject(pData) )
            pData = JSON.stringify(pData, null, 4);
            
        $.fancybox('<div id=CloudViewer tabindex=0>' + pData + '</div>', lConfig);
        
        DOM.Images.hideLoad();
    };
    
    /**
     * function shows FancyBox
     */
    FancyBox.show                       = function(pCallBack){
        set();
                
        var lConfig = getConfig(),
            lResult = Util.exec(pCallBack);
        
        if(!lResult){
            var lCurrentFile = DOM.getCurrentFile(),
                lA = DOM.getByClass('fancybox', lCurrentFile)[0];
            
            if(lA){
                if(lA.rel)
                    $.fancybox.open({ href : lA.href },
                        lConfig);
                else
                    FancyBox.loadData(lA, FancyBox.onDataLoaded);
            }
        }
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
                lShift      = event.shiftKey;
            
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