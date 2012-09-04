var CloudCommander, CloudFunc, $;
/* object contains viewer FancyBox
 * https://github.com/fancyapps/fancyBox
 */
(function(){
    var cloudcmd                                = CloudCommander;
    var Util                                    = cloudcmd.Util;
    var KeyBinding                            = cloudcmd.KeyBinding;
    
    CloudCommander.Viewer                       = {
        get: (function(){
            return this.FancyBox;
        })
    };
    
    CloudCommander.Viewer.FancyBox              = {};    
    
    CloudCommander.Viewer.dir                   = './lib/client/viewer/';
    CloudCommander.Viewer.FancyBox.dir          = CloudCommander.Viewer.dir + 
        'fancybox/';
        
    /* function return configureation
     * for FancyBox open and
     * onclick (it shoud be
     * different objects)
     */
    CloudCommander.Viewer.FancyBox.getConfig    = (function(){
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
                    opacity: 0.1,
                    css : {
                        'background-color'  : '#fff'                    
                    }
                }
            },
            padding : 0
        };
    });
    
    /* function loads css and js of FancyBox
     * @pParent     - this
     * @pCallBack   -  executes, when everything loaded
     */
    CloudCommander.Viewer.FancyBox.load         = (function(pThis, pCallBack){
        Util.jqueryLoad();
        
        var ljsLoad_f = function(){                                
            var lSrc = pThis.dir + 'jquery.fancybox.js';
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
                                'background: #fe57a1;'          +
                                'color: #fff;'                  +
                                'text-shadow: none;'            +
                        '}'
        });      
        
        var lSrc = pThis.dir +'jquery.fancybox.pack.css';
        Util.cssLoad({
            src  : lSrc,
            func : {
                onload: ljsLoad_f
            }   
        });
    });
    
    
    CloudCommander.Viewer.FancyBox.loadData          = (function(pA){
        Util.Images.showLoad();
        
        var lThis = this;
        var lConfig = this.getConfig();
                    
        var lLink = pA.href;
                        
        /* убираем адрес хоста*/
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
                /* if we got json - show it */
                if(typeof data === 'object')
                    data = JSON.stringify(data, null, 4);
                    
                $.fancybox('<div id=CloudViewer tabindex=0>' + data + '</div>', lConfig);
                
                Util.Images.hideLoad();
            }
        });
    });
    
    
    CloudCommander.Viewer.FancyBox.set          = (function(){
        if(Util.getByClass('fancybox').length)
            return;
        try{
            /* get current panel (left or right) */
            var lPanel = Util.getPanel();
                
            /* get all file links */
            var lA = Util.getByTag('a', lPanel);
            
            var lThis = this;
            
            var lDblClick_f = function(pA){
                return function(){
                    var lConfig  = lThis.getConfig();
                    lConfig.href = pA.href;
                    if(pA.rel)
                        $.fancybox(lConfig);
                    else
                        lThis.loadData(pA);
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
    });
    
    
    CloudCommander.Viewer.FancyBox.show         = (function(pCurrentFile){
        CloudCommander.Viewer.FancyBox.set();
                
        var lConfig = this.getConfig();
        
        if(typeof pCurrentFile !== 'function'){
            var lA = Util.getByClass('fancybox', pCurrentFile)[0];
            if(lA){
                if(lA.rel)
                    $.fancybox.open({ href : lA.href },
                        lConfig);
                else this.loadData(lA);
            }
        }
        else {
            var lFunc_f = pCurrentFile;
            lFunc_f();
        }
        
        Util.Images.hideLoad();
    });
    
    CloudCommander.Viewer.Keys                  = (function(pCurrentFile){
        "use strict";
                
        var lCallBack_f = (function(){
            var key_event = (function(pEvent){
                /* если клавиши можно обрабатывать */
                if( KeyBinding.get() )
                    /* if f3 pressed */
                    if(pEvent.keyCode === CloudCommander.KEY.F3 &&
                    pEvent.shiftKey){
                        var lCurrentFile = Util.getCurrentFile();
                        CloudCommander.Viewer.FancyBox.show(lCurrentFile);
                    
                        pEvent.preventDefault();
                    }
            });
               
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
            CloudCommander.Viewer.FancyBox.show(pCurrentFile);
            Util.Images.hideLoad();
        });
            
        CloudCommander.Viewer.FancyBox.load(this.FancyBox, lCallBack_f);
    });
})();