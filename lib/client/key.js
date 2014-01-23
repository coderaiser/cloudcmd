var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var Info    = DOM.CurrentInfo,
        Chars   = [],
        KEY     = {
            BACKSPACE   : 8,
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
            
            ASTERISK    : 106,
            PLUS        : 107,
            MINUS       : 109,
            
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
            
            SLASH       : 191,
            TRA         : 192, /* Typewritten Reverse Apostrophe (`) */
            BACKSLASH   : 220
        };
    
    KeyProto.prototype = KEY;
    CloudCmd.Key = KeyProto;
    
    function KeyProto() {
        var Key = this,
            Binded,
            TabPanel   = {
                'js-left'        : null,
                'js-right'       : null
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
                lKeyCode        = pEvent.keyCode,
                lAlt            = pEvent.altKey,
                ctrl            = pEvent.ctrlKey;
            /* если клавиши можно обрабатывать*/
            if (Binded) {
                if (!lAlt && !ctrl && lKeyCode >= KEY.A && lKeyCode <= KEY.Z)
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
                current     = Info.element,
                panel       = Info.panel,
                files       = Info.files,
                SMALL       = 32,
                char        = String.fromCharCode(pKeyCode),
                charSmall   = String.fromCharCode(pKeyCode + SMALL);
                
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
                current    = files[i];
                name        = DOM.getCurrentName(current);
                isContain   = Util.isContainStrAtBegin(name, [char, charSmall]);
                
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
            var i, n, id,
                current         = Info.element,
                panel           = Info.panel,
                path            = Info.path,
                dirPath         = Info.dirPath,
                filesPassive    = Info.filesPassive,
                prev            = current.previousSibling,
                next            = current.nextSibling,
                lKeyCode        = pEvent.keyCode,
                shift           = pEvent.shiftKey,
                lAlt            = pEvent.altKey,
                ctrl            = pEvent.ctrlKey;
            
            switch (lKeyCode) {
            case Key.TAB:
                id              = panel.id;
                TabPanel[id]   = current;
                
                panel           = Info.panelPassive;
                id              = panel.id;
                
                current        = TabPanel[id];
                
                if (current && current.parentElement)
                    DOM.setCurrentFile(current);
                else {
                    current = filesPassive[0];
                    DOM.setCurrentFile(current);
                }
                
                DOM.preventDefault(pEvent);//запрет на дальнейшее действие
                break;
            
            case Key.INSERT:
                DOM .toggleSelectedFile(current)
                    .setCurrentFile(next);
                break;
            
            case Key.DELETE:
                if (shift) {
                    if (Info.isDir)
                        path += '?dir';
                    
                    DOM.RESTful.delete(path, function() {
                        DOM.deleteCurrent(current);
                    });
                }
                else
                    DOM.promptDeleteSelected(current);
                break;
            
            case Key.ASTERISK:
                DOM.toggleAllSelectedFiles(current);
                break;
            
            case Key.PLUS:
                DOM.expandSelection();
                break;
            
            case Key.MINUS:
                DOM.shrinkSelection();
                break;
            
            case Key.SLASH:
                if (shift) {
                    Util.exec(CloudCmd.Help.show);
                    DOM.preventDefault(pEvent);
                }
                break;
                
            case Key.F1:
                Util.exec(CloudCmd.Help.show);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F2:
                DOM.renameCurrent(current);
                break;
                
            case Key.F3:
                Util.exec(CloudCmd.View.show);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F4:
                Util.exec(CloudCmd.Edit.show);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F5:
                DOM.copyCurrent(current);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F6:
                DOM.moveCurrent(current);
                DOM.preventDefault(pEvent);
                break;
            
            case Key.F7:
                DOM.promptNewDir();
                break;
            
            case Key.F8:
                DOM.promptDeleteSelected(current);
                break;
            
            case Key.F9:
                Util.exec(CloudCmd.Menu);
                DOM.preventDefault(pEvent);
                
                break;
            
            case Key.F10:
                Util.exec(CloudCmd.Config.show);
                DOM.preventDefault(pEvent);
                
                break;
            
            case Key.TRA:
                DOM.Images.showLoad({top: true});
                Util.exec(CloudCmd.Console.show);
                DOM.preventDefault(pEvent);
                
                break;
                
            case Key.SPACE:
                var lSelected,
                    isDir       = Info.isDir,
                    lName       = Info.name;
                
                if (!isDir || lName === '..')
                    lSelected   = true;
                else
                    lSelected   = Info.isSelected;
                    
                Util.ifExec(lSelected, function() {
                    DOM.toggleSelectedFile(current);
                }, function(pCallBack) {
                    DOM.loadCurrentSize(pCallBack, current);
                });
                
                
                DOM.preventDefault(pEvent);
                break;
            
            /* навигация по таблице файлов  *
             * если нажали клавишу вверх    *
             * выделяем предыдущую строку   */
            case Key.UP:
                if (shift)
                     DOM.toggleSelectedFile(current);
                
                DOM.setCurrentFile(prev);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу в низ - выделяем следующую строку    */
            case Key.DOWN:
                if (shift)
                     DOM.toggleSelectedFile(current);
                
                DOM.setCurrentFile(next);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу Home     *
             * переходим к самому верхнему  *
             * элементу                     */
            case Key.HOME:
                DOM.setCurrentFile(Info.first);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу End выделяем последний элемент   */
            case Key.END:
                DOM.setCurrentFile(Info.last);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу page down проматываем экран */
            case Key.PAGE_DOWN:
                DOM.scrollByPages(panel, 1);
                
                for (i = 0; i < 30; i++) {
                    
                    if (!current.nextSibling)
                        break;
                    
                    current = current.nextSibling;
                }
                DOM.setCurrentFile(current);
                DOM.preventDefault(pEvent);
                break;
            
            /* если нажали клавишу page up проматываем экран */
            case Key.PAGE_UP:
                DOM.scrollByPages(panel, -1);
                
                var tryCatch    = function(pCurrentFile) {
                        Util.tryCatch(function() {
                            return pCurrentFile
                                    .previousSibling
                                        .previousSibling
                                            .previousSibling
                                                .previousSibling;
                        });
                    };
                
                for (i = 0; i < 30; i++) {
                    if (!current.previousSibling || tryCatch(current) )
                        break;
                    
                    current = current.previousSibling;
                }
                
                DOM.setCurrentFile(current);
                DOM.preventDefault(pEvent);
                break;
                
            /* открываем папку*/
            case Key.ENTER:
                if (Info.isDir)
                    Util.exec(CloudCmd.loadDir());
                break;
                
            case Key.BACKSPACE:
                CloudCmd.goToParentDir();
                DOM.preventDefault(pEvent);
                break;
            
            case Key.BACKSLASH:
                if (ctrl) {
                    path    = '/';
                    Util.exec(CloudCmd.loadDir(path));
                }
                break;
            
            case Key.A:
                if (ctrl)
                    DOM .toggleAllSelectedFiles()
                        .preventDefault(pEvent);
                
                break;
            
            /* 
             * обновляем страницу,
             * загружаем содержимое каталога
             * при этом данные берём всегда с
             * сервера, а не из кэша
             * (обновляем кэш)
             */
            case Key.R:
                if (ctrl) {
                    Util.log('<ctrl>+r pressed\n' +
                            'reloading page...\n' +
                            'press <alt>+q to remove all key-handlers');
                    
                    CloudCmd.refresh();
                    DOM.preventDefault(pEvent);
                }
                break;
            
            /* чистим кэш */
            case Key.D:
                if (ctrl) {
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