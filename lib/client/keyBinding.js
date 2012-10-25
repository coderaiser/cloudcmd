var CloudCommander;
(function(){
    "use strict";
    
    var cloudcmd = CloudCommander;
    
    /* private property set or set key binding */
    var keyBinded;
    
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
    
    KeyBinding.init     = (function(){      
        var Util = cloudcmd.Util;
          
        /* saving state of tabs varibles */
        var lTabPanel   = {
            left        : 0,
            right       : 0
            
        };
        
        var key_event   = function(event){                
                /* получаем выдленный файл*/
                var lCurrentFile = Util.getCurrentFile(),
                    lName, i;
                /* если клавиши можно обрабатывать*/
                if(keyBinded && event){
                    var lKeyCode = event.keyCode;
                    
                    /* open configuration window */
                    if(lKeyCode === KEY.O && event.altKey){
                        console.log('openning config window...');
                        
                        Util.Images.showLoad();
                        if ( Util.isFunction(cloudcmd.Config) )
                            cloudcmd.Config();
                        
                    }
                    
                    else if(lKeyCode === KEY.G && event.altKey){
                        var lStorage = cloudcmd.Storage;
                        
                        if( Util.isFunction(lStorage) )
                            lStorage();
                    }
                    
                    /* если нажали таб:
                     * переносим курсор на
                     * правую панель, если
                     * мы были на левой и
                     * наоборот
                     */                                
                    else if(lKeyCode === KEY.TAB){
                        console.log('Tab pressed');
                                            
                        try{                        
                            /* changing parent panel of curent-file */
                            var lPanel = Util.getPanel();
                            var lId = lPanel.id;
                            
                            lTabPanel[lId] = lCurrentFile;
                            
                            lPanel = Util.getPanel({active:false});
                            lId = lPanel.id;
                                                                            
                            
                            if(lTabPanel[lId])
                                Util.setCurrentFile(lTabPanel[lId]);
                            else{
                                var lFirstFileOnList = Util.getByTag('li', lPanel)[2];
                                    
                                Util.setCurrentFile(lFirstFileOnList);
                            }
                                                                                                    
                        }catch(error){console.log(error);}
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }                
                    /* if f2 pressed */
                    else if(lKeyCode === KEY.F2){
                    
                    }
                    else if(lKeyCode === KEY.Delete)                                                
                        Util.removeCurrent(lCurrentFile);
                    
                    /* if f3 or shift+f3 or alt+f3 pressed */
                    else if(lKeyCode === KEY.F3){
                        Util.Images.showLoad();
                        
                        var lViewer     = cloudcmd.Viewer;
                        var lEditor     = cloudcmd.Editor;
                        
                        if(event.shiftKey &&  Util.isFunction(lViewer) )
                            lViewer();
                        
                        else if ( Util.isFunction(lEditor) )
                            lEditor(true);
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }                    
                    
                     /* if f4 pressed */ 
                    else if(lKeyCode === KEY.F4) {
                        Util.Images.showLoad();
                        
                        if ( Util.isFunction(cloudcmd.Editor) )
                            cloudcmd.Editor();
                            
                        event.preventDefault();//запрет на дальнейшее действие
                     }
                    else  if(lKeyCode === KEY.F10 &&
                            event.shiftKey){
                                if ( Util.isFunction(cloudcmd.Menu) )
                                    cloudcmd.Menu();
                            
                                event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    else if (lKeyCode === KEY.TRA){
                        Util.Images.showLoad({top: true});
                        if( Util.isFunction(cloudcmd.Terminal) )
                            cloudcmd.Terminal();
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
                            Util.setCurrentFile(lCurrentFile);                            
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
                            Util.setCurrentFile(lCurrentFile);
                          
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
                            Util.setCurrentFile(lCurrentFile);                                                        
                    
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
                            Util.setCurrentFile(lCurrentFile);                            
                            event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу page down
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_DOWN){
                        Util.getPanel().scrollByPages(1);
                        
                        for(i=0; i<30; i++){
                            if(!lCurrentFile.nextSibling) break;
                            
                            lCurrentFile = lCurrentFile.nextSibling;
                        }
                        Util.setCurrentFile(lCurrentFile);
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали клавишу page up
                     * проматываем экран
                     */
                    else if(lKeyCode === KEY.PAGE_UP){
                         Util.getPanel().scrollByPages(-1);
                        
                        for(i=0; i<30; i++){
                            if(!lCurrentFile.previousSibling) break;
                            else try{
                                lCurrentFile
                                    .previousSibling
                                        .previousSibling
                                            .previousSibling
                                                .previousSibling;
                                }
                                catch(pError){
                                    break;
                                }
                            lCurrentFile = lCurrentFile.previousSibling;
                        }
                        Util.setCurrentFile(lCurrentFile);
    
                    event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали Enter - открываем папку*/
                    else if(lKeyCode === KEY.ENTER){
                        /* если ненайдены выделенные файлы - выходим*/
                        if(!lCurrentFile)return;
    
                        /* из него достаём спан с именем файла*/
                        lName = Util.getByClass('name', lCurrentFile);
                        
                        /* если нету (что вряд ли) - выходим*/
                        if(!lName)return false;
                        
                        /* достаём все ссылки*/
                        var lATag = Util.getByTag('a', lName[0]);
                        
                        /* если нету - выходим */
                        if(!lATag)return false;
                        
                        /* вызываем ajaxload привязанный через changelinks
                         * пробуем нажать на ссылку, если не получиться
                         * (opera, ie), вызываем событие onclick,
                         */
                         
                        if(lCurrentFile.onclick)
                            lCurrentFile.onclick(true);
                        else try{
                            lATag[0].click();
                        }
                        catch(error){
                            console.log(error);
                        }
                        
                        event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали <ctr>+r
                     * обновляем страницу,
                     * загружаем содержимое каталога
                     * при этом данные берём всегда с
                     * сервера, а не из кэша
                     * (обновляем кэш)
                     */
                    else if(lKeyCode === KEY.R &&
                        event.ctrlKey){
                        console.log('<ctrl>+r pressed');
                        console.log('reloading page...');
                        console.log('press <alt>+q to remove all key-handlers');                                    
                        /* Программно нажимаем на кнопку перезагрузки 
                         * содержимого каталога
                         */
                        var lRefreshIcon        = Util.getRefreshButton();
                        if(lRefreshIcon){                                                  
                             /* получаем название файла*/
                             var lSelectedName  = Util.getCurrentName();
                            
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
                            console.log('<ctrl>+d pressed');
                            console.log('clearing cache...');
                            console.log('press <alt>+q to remove all key-handlers');
    
                            var lClearCache = Util.getById('clear-cache');
                            if(lClearCache && lClearCache.onclick)
                                lClearCache.onclick();
                      
                            event.preventDefault();//запрет на дальнейшее действие
                    }
                    
                    /* если нажали <alt>+q 
                     * убираем все обработчики
                     * нажатий клавиш
                     */             
                    else if(lKeyCode === KEY.Q &&
                        event.altKey){
                            //document.removeEventListener('keydown', key_event,false);
                            console.log('<alt>+q pressed');
                            console.log('<ctrl>+r reload key-handerl - removed');
                            console.log('<ctrl>+s clear cache key-handler - removed');
                            console.log('press <alt>+s to to set them');
                            
                            /* обработчик нажатий клавиш снят*/
                            keyBinded = false;
                            
                            event.preventDefault();//запрет на дальнейшее действие
                    }                                
                }
                
                /* если нажали <alt>+s 
                 * устанавливаем все обработчики
                 * нажатий клавиш
                 */             
                else if(lKeyCode === KEY.S &&
                    event.altKey){
                        /* обрабатываем нажатия на клавиши*/
                        keyBinded = true;
                        
                        console.log('<alt>+s pressed');
                        console.log('<ctrl>+r reload key-handerl - set');
                        console.log('<ctrl>+s clear cache key-handler - set');
                        console.log('press <alt>+q to remove them');
                        
                        event.preventDefault();//запрет на дальнейшее действие
                }
            
            return false;
        };
        
        /* добавляем обработчик клавишь */
        if(document.addEventListener)
            document.addEventListener('keydown', key_event, false);
        else document.onkeydown = key_event;
        
        /* клавиши назначены*/
        keyBinded = true;
    });
})();