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
        
        SPACE       : 32,
        PAGE_UP     : 33,
        PAGE_DOWN   : 34,
        END         : 35,
        HOME        : 36,
        UP          : 38,
        DOWN        : 40,
        
        INSERT      : 45,
        DELETE      : 46,
        
        A           : 65,
        
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
        F5          : 116,
        F6          : 117,
        F7          : 118,
        F8          : 119,
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
                var i, n, lCurrent  = DOM.getCurrentFile(),
                    lKeyCode        = pEvent.keyCode,
                    lShift          = pEvent.shiftKey,
                    lAlt            = pEvent.altKey,
                    lCtrl           = pEvent.ctrlKey;
                /* если клавиши можно обрабатывать*/
                if(keyBinded){
                    switch(lKeyCode){
                        case KEY.TAB:
                            /* changing parent panel of curent-file */
                            var lPanel = DOM.getPanel(),
                                lId = lPanel.id;
                            
                            lTabPanel[lId] = lCurrent;
                            
                            lPanel = DOM.getPanel({active:false});
                            lId = lPanel.id;
                            
                            if(lTabPanel[lId])
                                DOM.setCurrentFile(lTabPanel[lId]);
                            else{
                                var lFirstFileOnList = DOM.getByTag('li', lPanel)[2];
                                    
                                DOM.setCurrentFile(lFirstFileOnList);
                            }
                            
                            DOM.preventDefault(pEvent);//запрет на дальнейшее действие
                            break;
                        
                        case KEY.INSERT:
                            DOM.setSelectedFile( lCurrent );
                            DOM.setCurrentFile( lCurrent.nextSibling );
                            break;
                        
                        case KEY.DELETE:
                            if(lShift){
                                var lUrl = DOM.getCurrentPath(lCurrent);
                                
                                if( DOM.isCurrentIsDir(lCurrent) )
                                    lUrl += '?dir';
                                
                                DOM.RESTfull.delete(lUrl, function(){
                                    DOM.deleteCurrent(lCurrent);
                                });
                            }
                            else
                                DOM.promptDeleteCurrent(lCurrent);
                            break;
                        
                        case KEY.F1:
                            DOM.preventDefault(pEvent);
                            break;
                        
                        case KEY.F2:
                            DOM.renameCurrent(lCurrent);
                            break;
                            
                        case KEY.F3:
                            var lEditor = CloudCmd[lShift ? 'Viewer' : 'Editor'];
                            
                            Util.exec(lEditor, true);
                            DOM.preventDefault(pEvent);
                            break;
                        
                        case KEY.F4:
                            DOM.Images.showLoad();
                            Util.exec(CloudCmd.Editor);
                            DOM.preventDefault(pEvent);
                            break;
                        
                        case KEY.F5:
                            DOM.copyCurrent(lCurrent);
                            DOM.preventDefault(pEvent);
                            break;
                        
                        case KEY.F6:
                            DOM.moveCurrent(lCurrent);
                            DOM.preventDefault(pEvent);
                            break;
                        
                        case KEY.F7:
                            DOM.promptNewDir();
                            break;
                        
                        case KEY.F8:
                            DOM.promptDeleteCurrent(lCurrent);
                            break;
                        
                        case KEY.F:
                            DOM.promptDeleteCurrent(lCurrent);
                            break;
                        
                        case KEY.F10:
                            if(lShift){
                                Util.exec(CloudCmd.Menu);
                                DOM.preventDefault(pEvent);
                            }
                            break;
                        
                        case KEY.TRA:
                            DOM.Images.showLoad({top: true});
                            Util.exec(CloudCmd.Terminal);
                            break;
                            
                        case KEY.SPACE:
                            var lSelected   = DOM.isSelected(lCurrent),
                                lDir        = DOM.isCurrentIsDir(lCurrent);
                            
                            if(!lDir)
                                lSelected = true;
                                
                            Util.ifExec(lSelected, function(){
                                DOM.setSelectedFile(lCurrent);
                            }, function(pCallBack){
                                DOM.loadCurrentSize(pCallBack, lCurrent);
                            });

                            
                            DOM.preventDefault(pEvent);
                            break;
                        
                        /* навигация по таблице файлов  *
                         * если нажали клавишу вверх    *
                         * выделяем предыдущую строку   */
                        case KEY.UP:
                            if(lShift)
                                 DOM.setSelectedFile(lCurrent);
                            
                            DOM.setCurrentFile( lCurrent.previousSibling );
                            DOM.preventDefault( pEvent );
                            break;
                        
                        /* если нажали клавишу в низ    *
                         * выделяем следующую строку    */
                        case KEY.DOWN:
                            if(lShift)
                                 DOM.setSelectedFile(lCurrent);
                            
                            DOM.setCurrentFile( lCurrent.nextSibling );
                            DOM.preventDefault( pEvent );
                            break;
                        
                        /* если нажали клавишу Home     *
                         * переходим к самому верхнему  *
                         * элементу                     */
                        case KEY.HOME:
                            DOM.setCurrentFile( lCurrent.parentElement.firstChild );
                            DOM.preventDefault(pEvent);
                            break;
                        
                        /* если нажали клавишу End
                         * выделяем последний элемент   */
                        case KEY.END:
                            DOM.setCurrentFile( lCurrent.parentElement.lastElementChild );
                            DOM.preventDefault( pEvent );
                            break;
                        
                        /* если нажали клавишу page down
                         * проматываем экран            */
                        case KEY.PAGE_DOWN:
                            DOM.scrollByPages( DOM.getPanel(), 1 );
                            
                            for(i=0; i<30; i++){
                                if(!lCurrent.nextSibling) break;
                                
                                lCurrent = lCurrent.nextSibling;
                            }
                            DOM.setCurrentFile(lCurrent);
                            DOM.preventDefault(pEvent);
                            break;
                        
                        /* если нажали клавишу page up проматываем экран */
                        case KEY.PAGE_UP:
                            DOM.scrollByPages( DOM.getPanel(), -1 );
                            
                            var lC          = lCurrent,
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
                            break;
                        /* если нажали Enter - открываем папку*/
                        case KEY.ENTER:
                            if( DOM.isCurrentIsDir() )
                                Util.exec( CloudCmd.loadDir() );
                            break;
                        
                        case KEY.A:
                            if(pEvent.ctrlKey){
                                var lParent = lCurrent.parentElement,
                                    lNodes = lParent.childNodes;
                                
                                /* not path and fm_header */
                                for(i = 2, n = lNodes.length; i < n; i++)
                                    DOM.setSelectedFile( lNodes[i] );
                                
                                DOM.preventDefault(pEvent);
                            }
                            
                            break;
                        /* если нажали <ctr>+r
                         * обновляем страницу,
                         * загружаем содержимое каталога
                         * при этом данные берём всегда с
                         * сервера, а не из кэша
                         * (обновляем кэш)
                         */
                        case KEY.R:
                            if(lCtrl){
                                Util.log('<ctrl>+r pressed\n' +
                                        'reloading page...\n' +
                                        'press <alt>+q to remove all key-handlers');
                                
                                CloudCmd.refresh();
                                DOM.preventDefault(pEvent);
                            }
                        break;
                        
                        /* если нажали <ctrl>+d чистим кэш */
                        case KEY.D:
                            if(lCtrl){
                                Util.log('<ctrl>+d pressed\n'  +
                                    'clearing cache...\n' +
                                    'press <alt>+q to remove all key-handlers');
                                
                                DOM.Cache.clear();
                                DOM.preventDefault();
                            }
                            break;
                    
                        /* если нажали <alt>+q 
                         * убираем все обработчики
                         * нажатий клавиш */
                        case KEY.Q:
                            if(lAlt){
                                Util.log('<alt>+q pressed\n'                         +
                                            '<ctrl>+r reload key-handerl - removed'     +
                                            '<ctrl>+s clear cache key-handler - removed'+
                                            'press <alt>+s to to set them');
                                
                                /* обработчик нажатий клавиш снят*/
                                keyBinded = false;
                                DOM.preventDefault(pEvent);
                            }
                    }
                }
                
                /* если нажали <alt>+s 
                 * устанавливаем все обработчики
                 * нажатий клавиш
                 */             
                else if(lKeyCode === KEY.S && lAlt){
                    /* обрабатываем нажатия на клавиши*/
                    keyBinded = true;
                    Util.log('<alt>+s pressed\n'                         +
                                '<ctrl>+r reload key-handerl - set\n'       +
                                '<ctrl>+s clear cache key-handler - set\n'  +
                                'press <alt>+q to remove them');
                    DOM.preventDefault(pEvent);
                }
        };
        
        /* добавляем обработчик клавишь */
        DOM.addKeyListener(key_event);
        
        /* клавиши назначены*/
        keyBinded = true;
    };

})(CloudCommander, Util, DOM);