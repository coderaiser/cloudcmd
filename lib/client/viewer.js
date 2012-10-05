var CloudCommander, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        Util                            = CloudCommander.Util,
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
        if(Util.getByClass('fancybox').length)
            return;
        try{
            /* get current panel (left or right) */
            var lPanel = Util.getPanel();
                
            /* get all file links */
            var lA = Util.getByTag('a', lPanel);
                        
            var lDblClick_f = function(pA){
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
            for (var i=2; i < lA.length; i++) {
                var lName = lA[i].title || lA[i].textContent;
                
                lA[i].className    = 'fancybox';
                if(CloudFunc.checkExtension(lName, ['png','jpg', 'gif','ico'])){                
                    lA[i].rel          = 'gallery';
                }
                
                lA[i].ondblclick = lDblClick_f(lA[i]);
            }
                                    
        }catch(pError){
            console.log(pError);
        }
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
                var lEditor = Util.getById('CloudViewer');
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
        var ljsLoad_f = function(){
            var lSrc = FancyBox.dir + 'jquery.fancybox.js';
            Util.jsload(lSrc,{
                    onload: pCallBack
            });
        };
        
        Util.cssSet({id:'viewer',
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
        
        var lSrc = FancyBox.dir +'jquery.fancybox.css';
        Util.cssLoad({
            src  : lSrc,
            func : {
                onload: ljsLoad_f
            }   
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
        Util.Images.showLoad();
        
        var lThis = this;                    
        var lLink = pA.href;
                        
        /* убираем адрес хоста */
        lLink = '/' + lLink.replace(document.location.href,'');
        
        if (lLink.indexOf(CloudFunc.NOJS) === CloudFunc.FS.length)
            lLink = lLink.replace(CloudFunc.NOJS, '');
        
        Util.ajax({
            url     : lLink,
             error  : (function(jqXHR, textStatus, errorThrown){
                 lThis.loading             = false; 
                 return Util.Images.showError(jqXHR, textStatus, errorThrown);
             }),
             
             success:function(data, textStatus, jqXHR){                    
               if(typeof pSuccess_f === 'function')
                    pSuccess_f(data);
                                              
                Util.Images.hideLoad();
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
                
        var lConfig = this.getConfig();
        
        if( Util.isFunction(pCallBack) )
            pCallBack();            
        else{
            var lCurrentFile = Util.getCurrentFile();
            
            var lA = Util.getByClass('fancybox', lCurrentFile)[0];
            if(lA){
                if(lA.rel)
                    $.fancybox.open({ href : lA.href },
                        lConfig);
                else this.loadData(lA, this.onDataLoaded);
            }
        }
        
        Util.Images.hideLoad();
    };
    
    cloudcmd.Viewer.Keys                = function(){
        var lCallBack_f = (function(){
            
            var lF3 = cloudcmd.KEY.F3;
            var key_event = function(pEvent){
                /* если клавиши можно обрабатывать */
                if( KeyBinding.get() )
                    if(pEvent.keyCode === lF3 && pEvent.shiftKey){
                        var lCurrentFile = Util.getCurrentFile();
                        FancyBox.show(lCurrentFile);
                        
                        pEvent.preventDefault();
                    }
            };
               
            /* добавляем обработчик клавишь */
            if (document.addEventListener)                
                document.addEventListener('keydown', key_event, false);
            
            else{
                var lFunc;
                if(typeof document.onkeydown === 'function')
                    lFunc = document.onkeydown;
                
                document.onkeydown = function(){
                    if(lFunc)
                        lFunc();
                    
                    key_event();
                };
            }
            
            /* showing images  preview*/
            FancyBox.show();
            Util.Images.hideLoad();
        });
            
        Util.jqueryLoad(function(){
            FancyBox.load(lCallBack_f);
        });
    };
    
    cloudcmd.Viewer.FancyBox            = FancyBox;
})();