var CloudCommander, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    /* private property set or set key binding */
    var keyBinded;
    
    /* Key constants*/
    CloudCmd.KEY = {
        TAB         : 9,
        ENTER       : 13,
        ESC         : 27,
        
        PAGE_UP     : 33,
        PAGE_DOWN   : 34,
        END         : 35,
        HOME        : 36,
        UP          : 38,
        DOWN        : 40,
        
        Delete      : 46,
        
        D           : 68,
        
        G           : 71,
        
        O           : 79,
        Q           : 81,
        R           : 82,
        S           : 83,
        T           : 84,
        
        F1          : 112,
        F2          : 113,
        F3          : 114,
        F4          : 115,
        
        F6          : 117,
        F7          : 118,
        F10         : 121,
        
        TRA         : 192 /* Typewritten Reverse Apostrophe (`) */
    };
    
    var KEY = CloudCmd.KEY;
    
    CloudCmd.KeyBinding = {};
    
    var KeyBinding      = CloudCmd.KeyBinding;
    
    KeyBinding.get      = function(){return keyBinded;};
    
    KeyBinding.set      = function(){keyBinded = true;};
    
    KeyBinding.unSet    = function(){keyBinded = false;};
    
    KeyBinding.init     = function(){
        /* saving state of tabs varibles */
        var lTabPanel   = {
            left        : 0,
            right       : 0
            
        };
        
        var key_event   = function(pEvent){
                /* получаем выдленный файл*/
                var lCurrentFile = DOM.getCurrentFile(), i;
                /* если клавиши можно обрабатывать*/
                if(keyBinded && pEvent){
                    var lKeyCode = pEvent.keyCode;
                    
                    /* open configuration window */
                    if(lKeyCode === KEY.O && pEvent.altKey){
                        console.log('openning config window...');
                        
                        DOM.Images.showLoad({top: true});
                        
                        Util.exec(CloudCmd.Config);
                    }
                    
                    else if(lKeyCode === KEY.G && pEvent.altKey)
                        Util.exec(CloudCmd.GitHub);
                    
                    else if(lKeyCode === KEY.D && pEvent.altKey){
                        Util.exec(CloudCmd.DropBox);
                        DOM.preventDefault(pEvent);
                    }
                    
                    /* если нажали таб:
                     * переносим курсор на
                     * правую панель, если
                     * мы были на левой и
                     * наоборот
                     */
                    else if(lKeyCode === KEY.TAB){
                        console.log('Tab pressed');
                        
                        Util.tryCatchLog(function(){
                            /* changing parent panel of curent-file */
                            var lPanel = DOM.getPanel(),
                                lId = lPanel.id;
                            
                            lTabPanel[lId] = lCurrentFile;
                            
                            lPanel = DOM.getPanel({active:false});
                            lId = lPanel.id;
                            
                            if(lTabPanel[lId])
                                DOM.setCurrentFile(lTabPanel[lId]);
                            else{
                                var lFirstFileOnList = DOM.getByTag('li', lPanel)[2];
                                    
                                DOM.setCurrentFile(lFirstFileOnList);
                            }
                        });
                        
                        DOM.preventDefault(pEvent);//запрет на дальнейшее действие
                    }
                    else if(lKeyCode === KEY.Delete){
                        if(pEvent.shiftKey){
                            var lUrl = DOM.getCurrentPath(lCurrentFile);
                            
                            if( DOM.isCurrentIsDir(lCurrentFile) )
                                lUrl += '?dir';
                            
                            DOM.RESTfull.delete(lUrl, function(){
                                DOM.deleteCurrent(lCurrentFile);
                            });
                        }
                        else
                            DOM.promptDeleteCurrent(lCurrentFile);
                    }
                    else if(lKeyCode >= KEY.F1 && lKeyCode <= KEY.F10)
                        switch(lKeyCode){
                            case KEY.F1:
                                DOM.preventDefault(pEvent);
                                break;
                            
                            case KEY.F2:
                                DOM.renameCurrent(lCurrentFile);
                                break;
                                
                            case KEY.F3:
                                var lEditor = CloudCmd[pEvent.shiftKey ? 
                                    'Viewer' : 'Editor'];
                                Util.exec(lEditor, true);
                                DOM.preventDefault(pEvent);
                                break;
                            
                            case KEY.F4:
                                DOM.Images.showLoad();
                                Util.exec(CloudCmd.Editor);
                                DOM.preventDefault(pEvent);
                                break;
                            
                            case KEY.F6:
                                DOM.moveCurrent();
                                break;
                            
                            case KEY.F7:
                                DOM.promptNewFolder();
                                break;
                            
                            case KEY.F10:
                                if(pEvent.shiftKey){
                                    Util.exec(CloudCmd.Menu);
                                    DOM.preventDefault(pEvent);
                                }
                        }
                    
                    else if (lKeyCode === KEY.TRA){
                        DOM.Images.showLoad({top: true});
                        Util.exec(CloudCmd.Terminal);
                    }                        
                    /* навигация по таблице файлов  *
                     * если нажали клавишу вверх    *
                     * выделяем предыдущую строку   */
                    else if(lKeyCode === KEY.UP){
                        DOM.setCurrentFile( lCurrentFile.previousSibling );
                        DOM.preventDefault( pEvent );
                    }
                    
                    /* если нажали клавишу в низ    *
                     * выделяем следующую строку    */
                    else if(lKeyCode === KEY.DOWN){
                        DOM.setCurrentFile( lCurrentFile.nextSibling );
                        DOM.preventDefault( pEvent );
                    }
                    
                    /* если нажали клавишу Home     *
                     * переходим к самому верхнему  *
                     * элементу                     */
                    else if(lKeyCode === KEY.HOME){
                        DOM.setCurrentFile( lCurrentFile.parentElement.firstChild );
                        DOM.preventDefault(pEvent);
                    }
                    
                    /* если нажали клавишу End
                     * выделяем последний элемент
                     */
                    else if(lKeyCode === KEY.END){
                        DOM.setCurrentFile( lCurrentFile.parentElement.lastElementChild );
                        DOM.preventDefault( pEvent );
                    }
                    
                    /* если нажали клавишу page down
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_DOWN){
                        DOM.scrollByPages( DOM.getPanel(), 1 );
                        
                        for(i=0; i<30; i++){
                            if(!lCurrentFile.nextSibling) break;
                            
                            lCurrentFile = lCurrentFile.nextSibling;
                        }
                        DOM.setCurrentFile(lCurrentFile);
                        DOM.preventDefault(pEvent);
                    }
                    
                    /* если нажали клавишу page up
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_UP){
                        DOM.scrollByPages( DOM.getPanel(), -1 );
                        
                        var lC          = lCurrentFile,
                            tryCatch    = function(pCurrentFile){
                                Util.tryCatch(function(){
                                    return pCurrentFile
                                            .previousSibling
                                                .previousSibling
                                                    .previousSibling
                                                        .previousSibling;
                                });
                            };
                        
                        for(i = 0; i < 30; i++){
                            if(!lC.previousSibling || tryCatch(lC) ) break;
                            
                            lC = lC.previousSibling;
                        }
                        DOM.setCurrentFile(lC);
                        DOM.preventDefault(pEvent);
                    }
                    
                    /* если нажали Enter - открываем папку*/
                    else if(lKeyCode === KEY.ENTER && DOM.isCurrentIsDir())
                        Util.exec( CloudCmd.loadDir() );
                    
                    /* если нажали <ctr>+r
                     * обновляем страницу,
                     * загружаем содержимое каталога
                     * при этом данные берём всегда с
                     * сервера, а не из кэша
                     * (обновляем кэш)
                     */
                    else if(lKeyCode === KEY.R && pEvent.ctrlKey){
                        console.log('<ctrl>+r pressed\n' +
                                    'reloading page...\n' +
                                    'press <alt>+q to remove all key-handlers');
                            
                            CloudCmd.refresh();
                            DOM.preventDefault(pEvent);
                    }
                    
                    /* если нажали <ctrl>+d чистим кэш */
                    else if(lKeyCode === KEY.D && pEvent.ctrlKey){
                            Util.log('<ctrl>+d pressed\n'  +
                                'clearing cache...\n' +
                                'press <alt>+q to remove all key-handlers');
                            
                            DOM.Cache.clear();
                            DOM.preventDefault();
                    }
                    
                    /* если нажали <alt>+q 
                     * убираем все обработчики
                     * нажатий клавиш
                     */             
                    else if(lKeyCode === KEY.Q && pEvent.altKey){
                        console.log('<alt>+q pressed\n'                         +
                                    '<ctrl>+r reload key-handerl - removed'     +
                                    '<ctrl>+s clear cache key-handler - removed'+
                                    'press <alt>+s to to set them');
                        
                        /* обработчик нажатий клавиш снят*/
                        keyBinded = false;
                        
                        pEvent.preventDefault();//запрет на дальнейшее действие
                    }                                
                }
                
                /* если нажали <alt>+s 
                 * устанавливаем все обработчики
                 * нажатий клавиш
                 */             
                else if(pEvent.keyCode === KEY.S && pEvent.altKey){
                    /* обрабатываем нажатия на клавиши*/
                    keyBinded = true;
                    
                    console.log('<alt>+s pressed\n'                         +
                                '<ctrl>+r reload key-handerl - set\n'       +
                                '<ctrl>+s clear cache key-handler - set\n'  +
                                'press <alt>+q to remove them');
                    
                    pEvent.preventDefault();//запрет на дальнейшее действие
                }
        };
        
        /* добавляем обработчик клавишь */
        DOM.addKeyListener(key_event);
        
        /* клавиши назначены*/
        keyBinded = true;
    };

})(CloudCommander, Util, DOM);