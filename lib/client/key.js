var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var Info    = DOM.CurrentInfo,
        Events  = DOM.Events,
        Buffer  = DOM.Buffer,
        
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
            
            ZERO        : 48,
            
            A           : 65,
            
            C           : 67,
            D           : 68,
            
            G           : 71,
            
            O           : 79,
            Q           : 81,
            R           : 82,
            S           : 83,
            T           : 84,
            
            V           : 86,
            
            X           : 88,
            
            Z           : 90,
            
            INSERT_MAC  : 96,
            
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
            
            EQUAL       : 187,
            HYPHEN      : 189,
            DOT         : 190,
            SLASH       : 191,
            TRA         : 192, /* Typewritten Reverse Apostrophe (`) */
            BACKSLASH   : 220,
            
            BRACKET_CLOSE: 221
        };
    
    KeyProto.prototype = KEY;
    CloudCmd.Key = KeyProto;
    
    function KeyProto() {
        var Key = this,
            Binded;
        
        this.isBind     = function() {
            return Binded;
        };
        
        this.setBind    = function() {
            Binded = true;
        };
        
        this.unsetBind  = function() {
            Binded = false;
        };
        
        this.bind   = function() {
            Events.addKey(listener);
            Binded = true;
        };
        
        function listener(event) {
            /* получаем выдленный файл*/
            var keyCode         = event.keyCode,
                alt             = event.altKey,
                ctrl            = event.ctrlKey,
                shift           = event.shiftKey,
                meta            = event.metaKey,
                keyIdentifier   = event.keyIdentifier,
                isBetween       = keyCode >= KEY.ZERO && keyCode <= KEY.Z,
                isSymbol,
                char            = '';
            
            if (keyIdentifier)
                char = fromCharCode(keyIdentifier);
            else
                char = event.key;
            
            isSymbol = ~['.', '_', '-', '+', '='].indexOf(char);
            
            if (!isSymbol) {
                isSymbol = getSymbol(shift, keyCode);
                
                if (isSymbol)
                    char = isSymbol;
            }
            
            /* если клавиши можно обрабатывать*/
            if (Key.isBind())
                if (!alt && !ctrl && !meta && (isBetween || isSymbol))
                    setCurrentByChar(char);
                else {
                    Chars       = [];
                    switchKey(event);
                }
        }
        
        function getSymbol(shift, keyCode) {
            var char;
            
            switch (keyCode) {
            case KEY.DOT:
                char = '.';
                break;
            
            case KEY.HYPHEN:
                char = shift ? '_' : '-';
                break;
            
            case KEY.EQUAL:
                char = shift ? '+' : '=';
                break;
            }
            
            return char;
        }
        
        function fromCharCode(keyIdentifier) {
            var code    = keyIdentifier.substring(2),
                hex     = parseInt(code, 16),
                char    = String.fromCharCode(hex);
                
            return char;
        }
        
        function setCurrentByChar(char) {
            var name, isMatch, byName, firstByName,
                skipCount   = 0,
                skipN       = 0,
                setted      = false,
                current     = Info.element,
                files       = Info.files,
                escapeChar  = Util.escapeRegExp(char),
                regExp      = new RegExp('^' + escapeChar + '.*$', 'i'),
                i           = 0,
                n           = Chars.length;
            
            while(i < n && char === Chars[i]) {
                i++;
            }
            
            if (!i)
                Chars = [];
            
            skipN           = skipCount = i;
            Chars.push(char);
            
            n               = files.length;
            for (i = 0; i < n; i++) {
                current     = files[i];
                name        = DOM.getCurrentName(current);
                isMatch     = name.match(regExp);
                
                if (isMatch && name !== '..') {
                    byName = DOM.getCurrentByName(name);
                    
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
        
        function switchKey(event) {
            var i, name, isSelected, isDir, prev, next,
                current         = Info.element,
                panel           = Info.panel,
                path            = Info.path,
                keyCode         = event.keyCode,
                shift           = event.shiftKey,
                ctrl            = event.ctrlKey,
                meta            = event.metaKey,
                ctrlMeta        = ctrl || meta;
            
            if (current) {
                prev            = current.previousSibling;
                next            = current.nextSibling;
            }
            
            switch (keyCode) {
            case Key.TAB:
                DOM.changePanel();
                event.preventDefault();
                break;
            
            case Key.INSERT:
                DOM .toggleSelectedFile(current)
                    .setCurrentFile(next);
                break;
            
            case Key.INSERT_MAC:
                DOM .toggleSelectedFile(current)
                    .setCurrentFile(next);
                break;
            
            case Key.DELETE:
                if (shift)
                    DOM.sendDelete();
                else
                    DOM.promptDelete(current);
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
            
            case Key.F1:
                CloudCmd.Help.show();
                event.preventDefault();
                break;
            
            case Key.F2:
                DOM.renameCurrent(current);
                break;
                
            case Key.F3:
                if (shift)
                    CloudCmd.Markdown.show(path);
                else
                    CloudCmd.View.show();
                
                event.preventDefault();
                break;
            
            case Key.F4:
                CloudCmd.Edit.show();
                event.preventDefault();
                break;
            
            case Key.F5:
                DOM.copyFiles();
                event.preventDefault();
                break;
            
            case Key.F6:
                DOM.moveFiles();
                event.preventDefault();
                break;
            
            case Key.F7:
                if (shift)
                    DOM.promptNewFile();
                else
                    DOM.promptNewDir();
                
                event.preventDefault();
                break;
            
            case Key.F8:
                DOM.promptDelete(current);
                break;
            
            case Key.F9:
                CloudCmd.Menu.show();
                event.preventDefault();
                break;
            
            case Key.F10:
                CloudCmd.Config.show();
                event.preventDefault();
                break;
            
            case Key.TRA:
                DOM.Images.show.load('top');
                CloudCmd.Konsole.show();
                event.preventDefault();
                break;
            
            case KEY.BRACKET_CLOSE:
                DOM.Images.show.load('top');
                CloudCmd.Konsole.show();
                event.preventDefault();
                break;
                
            case Key.SPACE:
                isDir   = Info.isDir,
                name    = Info.name;
                
                if (!isDir || name === '..')
                    isSelected    = true;
                else
                    isSelected    = DOM.isSelected(current);
                    
                Util.exec.if(isSelected, function() {
                    DOM.toggleSelectedFile(current);
                }, function(callback) {
                    DOM.loadCurrentSize(callback, current);
                });
                
                event.preventDefault();
                break;
            
            /* навигация по таблице файлов  *
             * если нажали клавишу вверх    *
             * выделяем предыдущую строку   */
            case Key.UP:
                if (shift)
                     DOM.toggleSelectedFile(current);
                
                DOM.setCurrentFile(prev);
                event.preventDefault();
                break;
            
            /* если нажали клавишу в низ - выделяем следующую строку    */
            case Key.DOWN:
                if (shift)
                     DOM.toggleSelectedFile(current);
                
                DOM.setCurrentFile(next);
                event.preventDefault();
                break;
            
            /* если нажали клавишу Home     *
             * переходим к самому верхнему  *
             * элементу                     */
            case Key.HOME:
                DOM.setCurrentFile(Info.first);
                event.preventDefault();
                break;
            
            /* если нажали клавишу End выделяем последний элемент   */
            case Key.END:
                DOM.setCurrentFile(Info.last);
                event.preventDefault();
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
                event.preventDefault();
                break;
            
            /* если нажали клавишу page up проматываем экран */
            case Key.PAGE_UP:
                DOM.scrollByPages(panel, -1);
                
                for (i = 0; i < 30; i++) {
                    if (!current.previousSibling)
                        break;
                    
                    current = current.previousSibling;
                }
                
                DOM.setCurrentFile(current);
                event.preventDefault();
                break;
                
            /* открываем папку*/
            case Key.ENTER:
                if (Info.isDir)
                    CloudCmd.loadDir({
                        path: DOM.getCurrentPath()
                    });
                break;
                
            case Key.BACKSPACE:
                CloudCmd.goToParentDir();
                event.preventDefault();
                break;
            
            case Key.BACKSLASH:
                if (ctrlMeta)
                    CloudCmd.loadDir({
                        path: '/'
                    });
                break;
            
            case Key.A:
                if (ctrlMeta) {
                    DOM.toggleAllSelectedFiles();
                    event.preventDefault();
                }
                
                break;
            
            /**
             * обновляем страницу,
             * загружаем содержимое каталога
             * при этом данные берём всегда с
             * сервера, а не из кэша
             * (обновляем кэш)
             */
            case Key.R:
                if (ctrlMeta) {
                    CloudCmd.log('reloading page...\n');
                    
                    CloudCmd.refresh();
                    event.preventDefault();
                }
                break;
            
            case Key.C:
                if (ctrlMeta)
                    Buffer.copy();
                break;
            
            case Key.X:
                if (ctrlMeta)
                    Buffer.cut();
                break;
                
            case Key.V:
                if (ctrlMeta)
                   Buffer.paste();
                break;
            
            case Key.Z:
                if (ctrlMeta)
                    Buffer.clear();
                break;
            
            /* чистим хранилище */
            case Key.D:
                if (ctrlMeta) {
                    CloudCmd.log('clearing storage...');
                    
                    DOM.Storage.clear(function() {
                        CloudCmd.log('storage cleared');
                    });
                    
                    event.preventDefault();
                }
                break;
            }
        }
    }

})(CloudCmd, Util, DOM);
