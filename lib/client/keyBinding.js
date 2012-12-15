var CloudCommander, Util, DOM;
(function(){
    "use strict";
    
    DOM.Images.hideLoad();
    
    var cloudcmd = CloudCommander,
    /* private property set or set key binding */
        keyBinded;
    
    /* Key constants*/
    cloudcmd.KEY = {
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
        
        F2          : 113,
        F3          : 114,
        F4          : 115,
        F10         : 121,
        
        TRA         : 192 /* Typewritten Reverse Apostrophe (`) */
    };
    
    var KEY = cloudcmd.KEY;
    
    cloudcmd.KeyBinding = {};
    
    var KeyBinding      = cloudcmd.KeyBinding;
    
    KeyBinding.get      = function(){return keyBinded;};
    
    KeyBinding.set      = function(){keyBinded = true;};
    
    KeyBinding.unSet    = function(){keyBinded = false;};
    
    KeyBinding.init     = function(){
        /* saving state of tabs varibles */
        var lTabPanel   = {
            left        : 0,
            right       : 0
            
        };
        
        var key_event   = function(event){
                /* получаем выдленный файл*/
                var lCurrentFile = DOM.getCurrentFile(),
                    lName, i;
                /* если клавиши можно обрабатывать*/
                if(keyBinded && event){
                    var lKeyCode = event.keyCode;
                    
                    /* open configuration window */
                    if(lKeyCode === KEY.O && event.altKey){
                        console.log('openning config window...');
                        
                        DOM.Images.showLoad({top: true});
                        
                        Util.exec(cloudcmd.Config);
                    }
                    
                    else if(lKeyCode === KEY.G && event.altKey)
                        Util.exec(cloudcmd.GitHub);
                    
                    else if(lKeyCode === KEY.D && event.altKey){
                        Util.exec(cloudcmd.DropBox);
                        event.preventDefault();
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
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    else if(lKeyCode === KEY.Delete)
                        DOM.promptRemoveCurrent(lCurrentFile);
                    
                    /* if f3 or shift+f3 or alt+f3 pressed */
                    else if(lKeyCode === KEY.F3){
                            var lEditor = cloudcmd[event.shiftKey ? 
                                'Viewer' : 'Editor'];
                            
                            Util.exec(lEditor, true);
                            
                        event.preventDefault();//запрет на дальнейшее действие
                    }                    
                    
                     /* if f4 pressed */ 
                    else if(lKeyCode === KEY.F4) {
                        DOM.Images.showLoad();
                        
                        Util.exec(cloudcmd.Editor);
                            
                        event.preventDefault();//запрет на дальнейшее действие
                     }
                    else  if(lKeyCode === KEY.F10 && event.shiftKey){
                        Util.exec(cloudcmd.Menu);
                    
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    else if (lKeyCode === KEY.TRA){
                        DOM.Images.showLoad({top: true});
                        Util.exec(cloudcmd.Terminal);
                    }                        
                    /* навигация по таблице файлов*/
                    /* если нажали клавишу вверх*/
                    else if(lKeyCode === KEY.UP){                    
                        /* если ненайдены выделенные файлы - выходим*/
                        if(!lCurrentFile) return;
                        
                        /* если это строка существет и
                         * если она не заголовок
                         * файловой таблицы
                         */
                        lCurrentFile = lCurrentFile.previousSibling;
                        if(lCurrentFile){
                            /* выделяем предыдущую строку*/
                            DOM.setCurrentFile(lCurrentFile);                            
                        }
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу в низ*/
                    else if(lKeyCode === KEY.DOWN){                                            
                        /* если ненайдены выделенные файлы - выходим*/
                        if(!lCurrentFile)return;
                        
                        lCurrentFile = lCurrentFile.nextSibling;
                        /* если это не последняя строка */
                        if(lCurrentFile){
                            /* выделяем следующую строку*/
                            DOM.setCurrentFile(lCurrentFile);
                          
                            event.preventDefault();//запрет на дальнейшее действие
                        }
                    }
                    
                    /* если нажали клавишу Home
                     * переходим к самому верхнему
                     * элементу
                     */
                    else if(lKeyCode === KEY.HOME){
                            /* получаем первый элемент
                             * пропускаем путь и заголовки столбиков
                             * выделяем верхий файл
                             */
                            lCurrentFile = lCurrentFile.
                                parentElement.firstChild;
                            
                            /* set current file and 
                             * move scrollbar to top
                             */
                            DOM.setCurrentFile(lCurrentFile);                                                        
                    
                    event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу End
                     * выделяем последний элемент
                     */
                    else if(lKeyCode === KEY.END){
                            /* выделяем самый нижний файл */
                            lCurrentFile = lCurrentFile.
                                parentElement.lastElementChild;
                            
                            /* set current file and 
                             * move scrollbar to bottom
                             */
                            DOM.setCurrentFile(lCurrentFile);                            
                            event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу page down
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_DOWN){
                        DOM.getPanel().scrollByPages(1);
                        
                        for(i=0; i<30; i++){
                            if(!lCurrentFile.nextSibling) break;
                            
                            lCurrentFile = lCurrentFile.nextSibling;
                        }
                        DOM.setCurrentFile(lCurrentFile);
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу page up
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_UP){
                        DOM.getPanel().scrollByPages(-1);
                        
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
                    
                    event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали Enter - открываем папку*/
                    else if(lKeyCode === KEY.ENTER)
                        Util.exec(lCurrentFile.ondblclick, true);
                    
                    /* если нажали <ctr>+r
                     * обновляем страницу,
                     * загружаем содержимое каталога
                     * при этом данные берём всегда с
                     * сервера, а не из кэша
                     * (обновляем кэш)
                     */
                    else if(lKeyCode === KEY.R &&
                        event.ctrlKey){
                        console.log('<ctrl>+r pressed\n' +
                                    'reloading page...\n' +
                                    'press <alt>+q to remove all key-handlers');
                        
                        /* Программно нажимаем на кнопку перезагрузки 
                         * содержимого каталога
                         */
                        var lRefreshIcon        = DOM.getRefreshButton();
                        if(lRefreshIcon){                                                  
                             /* получаем название файла*/
                             var lSelectedName  = DOM.getCurrentName();
                            
                             /* если нашли элемент нажимаем него
                              * а если не можем - нажимаем на 
                              * ссылку, на которую повешен eventHandler
                              * onclick
                              */
                            lRefreshIcon.onclick();                            
                            cloudcmd._currentToParent(lSelectedName);
                            event.preventDefault();//запрет на дальнейшее действие
                        }
                    }
                    
                    /* если нажали <ctrl>+d чистим кэш */
                    else if(lKeyCode === KEY.D &&
                        event.ctrlKey){
                            console.log('<ctrl>+d pressed\n'  +
                                        'clearing cache...\n' +
                                        'press <alt>+q to remove all key-handlers');
                            
                            var lClearCache = DOM.getById('clear-cache');
                            if(lClearCache && lClearCache.onclick)
                                lClearCache.onclick();
                                
                            event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали <alt>+q 
                     * убираем все обработчики
                     * нажатий клавиш
                     */             
                    else if(lKeyCode === KEY.Q && event.altKey){
                        console.log('<alt>+q pressed\n'                         +
                                    '<ctrl>+r reload key-handerl - removed'     +
                                    '<ctrl>+s clear cache key-handler - removed'+
                                    'press <alt>+s to to set them');
                        
                        /* обработчик нажатий клавиш снят*/
                        keyBinded = false;
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }                                
                }
                
                /* если нажали <alt>+s 
                 * устанавливаем все обработчики
                 * нажатий клавиш
                 */             
                else if(event.keyCode === KEY.S && event.altKey){
                    /* обрабатываем нажатия на клавиши*/
                    keyBinded = true;
                    
                    console.log('<alt>+s pressed\n'                         +
                                '<ctrl>+r reload key-handerl - set\n'       +
                                '<ctrl>+s clear cache key-handler - set\n'  +
                                'press <alt>+q to remove them');
                    
                    event.preventDefault();//запрет на дальнейшее действие
                }
        };
        
        /* добавляем обработчик клавишь */
        DOM.addKeyListener(key_event);
        
        /* клавиши назначены*/
        keyBinded = true;
    };
})();