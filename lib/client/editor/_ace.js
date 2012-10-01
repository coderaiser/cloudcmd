var CloudCommander, CloudFunc, ace;
/* object contains editors Ace
 * and later will be Ace
 */
 (function(){
    "use strict";
    var cloudcmd                    = CloudCommander,
        Util                        = CloudCommander.Util,
        KeyBinding                  = CloudCommander.KeyBinding,
        AceEditor                   = {},
        AceLoaded                   = false,
        ReadOnly                    = false,
        AceElement,
        FM;
    
    CloudCommander.Editor           = {
        get : (function(){
            return this.Ace;
        })
    };    
    
    cloudcmd.Editor.dir             = 'lib/client/editor/';
    AceEditor.dir                   = cloudcmd.Editor.dir + 'ace/';
    
    
      /* private functions */
    function initCodeMirror(pValue){
        if(!FM)
            FM = Util.getById('fm');
        
        AceElement = Util.anyload({
            name        : 'div',
            id          : 'CodeMirrorEditor',
            className   : 'panel',
            parent      : FM
        });
        
        var editor = ace.edit("AceEditor");
                        
            editor.setTheme("ace/theme/tomorrow_night_blue");
            editor.getSession().setMode("ace/mode/javascript");
            
            /*
                editor.commands.addCommand({
                    name    : 'new_command',
                    //bindKey : {win: 'Esc',  mac: 'Esc'},
                    bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
                    exec    : function(pEditor){
                        lThis.hide();
                    }
                });
            */
            
            editor.setReadOnly(ReadOnly);
            
            editor.setValue(pValue);
    }
    
    /* indicator says Ace still loads */
    AceEditor.loading             = false;
    
    /* function loads Ace js and css files */
    AceEditor.load                = (function(){
        Util.cssSet({id:'editor',
            inner : '#AceEditor{'                   +
                        'font-size   : 15px;'       +
                        'padding     : 0 0 0 0;'    +
                    '}'
        });
        
        /* load Ace main module */
        Util.jsload(AceEditor.dir + 'ace.js', function() {
            Util.jsload(AceEditor.dir + 'mode-javascript.js',
                function(){
                    AceLoaded = true;
                    AceEditor.show();
                });
        });
    });
        
     /* function shows Ace editor */
    AceEditor.show                = (function(){
        /* if Ace function show already
         * called do not call it again
         * if f4 key pressed couple times
         */
        if(this.loading)
            return;
        
        if(!AceLoaded){
            return AceEditor.load();
        }
                
        /* getting link */
        var lCurrentFile = Util.getCurrentFile(),
            lA = Util.getCurrentLink(lCurrentFile);
            lA = lA.href;
                    
        /* убираем адрес хоста*/
        lA = '/' + lA.replace(document.location.href,'');
        
        /* checking is this link is to directory */
        var lSize = Util.getByClass('size', lCurrentFile);
        if(lSize){
            lSize = lSize[0].textContent;
            
            /* if directory - load json
             * not html data
             */
            if (lSize === '<dir>'){
                if (lA.indexOf(CloudFunc.NOJS) ===
                    CloudFunc.FS.length) {                    
                        lA = lA.replace(CloudFunc.NOJS, '');
                        /* when folder view 
                         * is no need to edit
                         * data
                         */
                        ReadOnly = true;
                }
            }
        }
            
        this.loading = true;
        setTimeout(function(){
            lThis.loading = false;},
            400);
            
        /* reading data from current file */
        Util.ajax({
            url:lA,
             error: (function(jqXHR, textStatus, errorThrown){
                 lThis.loading             = false; 
                 
                 return Util.Images.showError(jqXHR);
             }),
             
             success:function(data, textStatus, jqXHR){                    
                /* if we got json - show it */
                if(typeof data === 'object')
                    data = JSON.stringify(data, null, 4);
                
                initAce_f(data);
                
                /* removing keyBinding if set */
                KeyBinding.unSet();
                            
                Util.hidePanel();
                Util.Images.hideLoad();
                
                lThis.loading               = false;
            }
        });
    });
    
    /* function hides Ace editor */
    AceEditor.hide                = (function() {
        var lElem = AceElement;
        KeyBinding.set();
        
        if(lElem && FM)
            FM.removeChild(lElem);
        
        Util.showPanel();
    });
    
    cloudcmd.Editor.Keys            = (function(pCurrentFile, pIsReadOnly){
        "use strict";
              
        var lThis = this.Ace;
        /* loading js and css of Ace */
        this.Ace.show(pCurrentFile, pIsReadOnly);
        
        var key_event = function(pEvent){
    
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if f4 or f3 pressed */
                var lF3 = cloudcmd.KEY.F3;
                var lF4 = cloudcmd.KEY.F4;
                var lShow = Util.bind(lThis.show, lThis);
                                
                if(!pEvent.shiftKey){
                    if(pEvent.keyCode === lF4)
                        lShow();
                    else if(pEvent.keyCode === lF3){
                        lShow(true);
                    }
                }
            }else if (pEvent.keyCode === cloudcmd.KEY.ESC)
                AceEditor.hide();
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event,false);        
                  
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
    });
    
    cloudcmd.Editor.Ace      = AceEditor;
})();