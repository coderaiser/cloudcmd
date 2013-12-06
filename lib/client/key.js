var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var Chars   = [],
        KEY = {
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
        
        Z           : 90,
        
        F1          : 112,
        F2          : 113,
        F3          : 114,
        F4          : 115,
        F5          : 116,
        F6          : 117,
        F7          : 118,
        F8          : 119,
        F9          : 120,
        F10         : 121,
        
        TRA         : 192 /* Typewritten Reverse Apostrophe (`) */
    };
    
    KeyProto.prototype = KEY;
    CloudCmd.Key = KeyProto;
    
    function KeyProto() {
        var Key = this,
            Binded,
            lTabPanel   = {
                left        : 0,
                right       : 0
            };
        
        this.isBind     = function() {return Binded;};
        
        this.setBind    = function() {Binded = true;};
        
        this.unsetBind  = function() {Binded = false;};
        
        this.bind   = function() {
            DOM.Events.addKey(listener);
            
            /* клавиши назначены*/
            Binded = true;
        };
        
        function listener(pEvent) {
            /* получаем выдленный файл*/
            var i, n,
                lCurrent        = DOM.getCurrentFile(),
                lKeyCode        = pEvent.keyCode,
                lAlt            = pEvent.altKey,
                lCtrl           = pEvent.ctrlKey;
            /* если клавиши можно обрабатывать*/
            if (Binded) {
                if (!lAlt && !lCtrl && lKeyCode >= KEY.A && lKeyCode <= KEY.Z)
                    setCurrentByLetter(lKeyCode);
                else {
                    Chars       = [];
                    switchKey(pEvent);
                }
                
                /* устанавливаем все обработчики
                 * нажатий клавиш
                 */          
                } else if (lKeyCode === Key.S && lAlt) {
                /* обрабатываем нажатия на клавиши*/
                Binded = true;
                Util.log('<alt>+s pressed                           \n' +
                            '<ctrl>+r reload key-handerl - set      \n' +
                            '<ctrl>+s clear Storage key-handler - set \n' +
                            'press <alt>+q to remove them');
                
                DOM.preventDefault(pEvent);
            }
        }
        
        function setCurrentByLetter(pKeyCode) {
            var i, n, name, isCurrent, isContain, byName, firstByName,
                skipCount   = 0,
                skipN       = 0,
                setted      = false,
                lCurrent    = DOM.getCurrentFile(),
                files       = DOM.getFiles(),
                SMALL       = 32,
                charBig     = String.fromCharCode(pKeyCode),
                char        = String.fromCharCode(pKeyCode + SMALL);
                
            n               = Chars.length;
            for (i = 0; i < n; i++)
                if (char !== Chars[i])
                    break;
            
            if (!i)
                Chars = [];
            
            skipN           = skipCount = i;
            Chars.push(char);
            
            n               = files.length;
            for (i = 0; i < n; i++) {
                lCurrent    = files[i];
                name        = DOM.getCurrentName(lCurrent);
                isContain   = Util.isContainStrAtBegin(name, [char, charBig]);
                
                if (isContain) {
                    byName = DOM.getCurrentFileByName(name);
                    
                    if (!skipCount) {
                        setted = true;
                        DOM.setCurrentFile(byName);
                        break;
                    } else {
                        if (skipN === skipCount)
                            firstByName = byName;
                        
                        --skipCount;
                    }
                }
            }
            
            if (!setted) {
                DOM.setCurrentFile(firstByName);
                Chars = [char];
            }
        }
        
        function switchKey(pEvent) {
            var i, n, lCurrent  = DOM.getCurrentFile(),
                lKeyCode        = pEvent.keyCode,
                lShift          = pEvent.shiftKey,
                lAlt            = pEvent.altKey,
                lCtrl           = pEvent.ctrlKey;
            
            switch (lKeyCode) {
            case Key.TAB:
                /* changing parent panel of curent-file */
                var lFirstFileOnList,
                    lPanel      = DOM.getPanel(),
                    lId         = lPanel.id;
                
                lTabPanel[lId]  = lCurrent;
                
                lPanel          = DOM.getPanel({active:false});
                lId             = lPanel.id;
                
                lCurrent        = lTabPanel[lId];
                if (lCurrent && lCurrent.parentElement)
                    DOM.setCurrentFile(lCurrent);
                else {
                    lFirstFileOnList = DOM.getByTag('li', lPanel)[2];
                        
                    DOM.setCurrentFile(lFirstFileOnList);
                }
                
                DOM.preventDefault(pEvent);//запрет на дальнейшее действие
                break;
            
            case Key.INSERT:
                DOM .toggleSelectedFile(lCurrent)
                    .setCurrentFile(lCurrent.nextSibling);
                break;
            
            case Key.DELETE:
                if (lShift) {
                    var lUrl = DOM.getCurrentPath(lCurrent);
                    
                    if ( DOM.isCurrentIsDir(lCurrent) )
                        lUrl += '?dir';
                    
                    DOM.RESTful.delete(lUrl, function() {
                        DOM.deleteCurrent(lCurrent);
                    });
                }
                else
                    DOM.promptDeleteSelected(lCurrent);
                break;
            
            case Key.F1:
                Util.exec(CloudCmd.Help);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F2:
                DOM.renameCurrent(lCurrent);
                break;
                
            case Key.F3:
                Util.exec(CloudCmd.View);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F4:
                Util.exec(CloudCmd.Edit);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F5:
                DOM.copyCurrent(lCurrent);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F6:
                DOM.moveCurrent(lCurrent);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F7:
                DOM.promptNewDir();
                break;
            
            case Key.F8:
                DOM.promptDeleteSelected(lCurrent);
                break;
            
            case Key.F9:
                Util.exec(CloudCmd.Menu);
                DOM.preventDefault(pEvent);
                
                break;
            
            case Key.F10:
                Util.exec(CloudCmd.Config);
                DOM.preventDefault(pEvent);
                
                break;
            
            case Key.TRA:
                DOM.Images.showLoad({top: true});
                Util.exec(CloudCmd.Console);
                
                break;
                
            case Key.SPACE:
                var lSelected   = DOM.isSelected(lCurrent),
                    lDir        = DOM.isCurrentIsDir(lCurrent),
                    lName       = DOM.getCurrentName(lCurrent);
                
                if (!lDir || lName === '..')
                    lSelected = true;
                    
                Util.ifExec(lSelected, function() {
                    DOM.toggleSelectedFile(lCurrent);
                }, function(pCallBack) {
                    DOM.loadCurrentSize(pCallBack, lCurrent);
                });
                
                
                DOM.preventDefault(pEvent);
                break;
            
            /* навигация по таблице файлов  *
             * если нажали клавишу вверх    *
             * выделяем предыдущую строку   */
            case Key.UP:
                if (lShift)
                     DOM.toggleSelectedFile(lCurrent);
                
                DOM.setCurrentFile( lCurrent.previousSibling );
                DOM.preventDefault( pEvent );
                break;
            
            /* если нажали клавишу в низ - выделяем следующую строку    */
            case Key.DOWN:
                if (lShift)
                     DOM.toggleSelectedFile(lCurrent);
                
                DOM.setCurrentFile( lCurrent.nextSibling );
                DOM.preventDefault( pEvent );
                break;
            
            /* если нажали клавишу Home     *
             * переходим к самому верхнему  *
             * элементу                     */
            case Key.HOME:
                DOM.setCurrentFile( lCurrent.parentElement.firstChild );
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу End выделяем последний элемент   */
            case Key.END:
                DOM.setCurrentFile( lCurrent.parentElement.lastElementChild );
                DOM.preventDefault( pEvent );
                break;
            
            /* если нажали клавишу page down проматываем экран */
            case Key.PAGE_DOWN:
                DOM.scrollByPages( DOM.getPanel(), 1 );
                
                for (i = 0; i < 30; i++) {
                    
                    if (!lCurrent.nextSibling)
                        break;
                    
                    lCurrent = lCurrent.nextSibling;
                }
                DOM.setCurrentFile(lCurrent);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу page up проматываем экран */
            case Key.PAGE_UP:
                DOM.scrollByPages(DOM.getPanel(), -1);
                
                var lC          = lCurrent,
                    tryCatch    = function(pCurrentFile) {
                        Util.tryCatch(function() {
                            return pCurrentFile
                                    .previousSibling
                                        .previousSibling
                                            .previousSibling
                                                .previousSibling;
                        });
                    };
                
                for (i = 0; i < 30; i++) {
                    if (!lC.previousSibling || tryCatch(lC) ) break;
                    
                    lC = lC.previousSibling;
                }
                
                DOM.setCurrentFile(lC);
                DOM.preventDefault(pEvent);
                break;
                
            /* открываем папку*/
            case Key.ENTER:
                if (DOM.isCurrentIsDir())
                    Util.exec( CloudCmd.loadDir() );
                break;
            
            case Key.A:
                if (pEvent.ctrlKey) {
                    DOM .toggleAllSelectedFiles(lCurrent)
                        .preventDefault(pEvent);
                }
                break;
            
            /* 
             * обновляем страницу,
             * загружаем содержимое каталога
             * при этом данные берём всегда с
             * сервера, а не из кэша
             * (обновляем кэш)
             */
            case Key.R:
                if (lCtrl) {
                    Util.log('<ctrl>+r pressed\n' +
                            'reloading page...\n' +
                            'press <alt>+q to remove all key-handlers');
                    
                    CloudCmd.refresh();
                    DOM.preventDefault(pEvent);
                }
                break;
            
            /* чистим кэш */
            case Key.D:
                if (lCtrl) {
                    Util.log('<ctrl>+d pressed\n'  +
                        'clearing Storage...\n' +
                        'press <alt>+q to remove all key-handlers');
                    
                    DOM.Storage.clear();
                    DOM.preventDefault();
                }
                break;
            
            /* убираем все обработчики нажатий клавиш */
            case Key.Q:
                if (lAlt) {
                    Util.log('<alt>+q pressed\n'                         +
                                '<ctrl>+r reload key-handerl - removed'     +
                                '<ctrl>+s clear Storage key-handler - removed'+
                                'press <alt>+s to to set them');
                    
                    Binded = false;
                    DOM.preventDefault(pEvent);
                }
                break;
            }
        }
    }

})(CloudCmd, Util, DOM);