var Util, DOM, CloudCmd;

(function (Util, DOM) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(CloudCmd, Util, DOM);
     
     function ListenersProto(CloudCmd, Util, DOM) {
        var Info                = DOM.CurrentInfo,
            Storage             = DOM.Storage,
            Events              = DOM.Events,
            getConfig           = CloudCmd.getConfig;
        
        this.analytics          = function() {
            getConfig(function(config) {
                var analytics   = config.analytics,
                    online      = config.online;
                    
                if (analytics && online) {
                    Events.addOnce('mousemove', function() {
                        var FIVE_SECONDS    = 5000,
                            lUrl            = CloudCmd.LIBDIRCLIENT + 'analytics.js';
                        
                        setTimeout(function() {
                            DOM.jsload(lUrl);
                        }, FIVE_SECONDS);
                    });
                }
            });
        };
        
        this.init = function () {
            appStorage();
            contextMenu();
            dragndrop();
            unload();
            pop();
            online();
        };
        
        this.initKeysPanel          = function() {
            var button, id, func,
                keysElement     = DOM.getByClass('keyspanel')[0],
                keysPanel       = {},
                
                onceClickFuncs  = {
                    'f1'        : CloudCmd.Help,
                    'f3'        : CloudCmd.View,
                    'f4'        : CloudCmd.Edit,
                    'f9'        : CloudCmd.Menu,
                    'f10'       : CloudCmd.Config,
                    '~'         : CloudCmd.Console,
                    'contact'   : CloudCmd.Contact
                };
                
                for (id in onceClickFuncs) {
                    button  = DOM.getById(id);
                    
                    if (button) {
                        func            = onceClickFuncs[id];
                        keysPanel[id]   = button;
                        
                        Events.addOnce('click', func, button);
                    }
                }
            
            if (keysElement)
                Events.addClick(function(event) {
                    var element = event.target,
                        id      = element.id,
                        
                        clickFuncs      = {
                            'f2'        : DOM.renameCurrent,
                            'f5'        : DOM.copyCurrent,
                            'f6'        : DOM.moveCurrent,
                            'f7'        : DOM.promptNewDir,
                            'f8'        : DOM.promptDeleteSelected
                        },
                        
                        func    = clickFuncs[id];
                    
                    Util.exec(func);
                    
                }, keysElement);
            
            return keysPanel;
        };
        
        /**
         * функция меняет ссыки на ajax-овые 
         * @param pPanelID
         */
        this.changeLinks            = function(pPanelID) {
            /* назначаем кнопку очистить кэш и показываем её */
            var lPanel          = DOM.getById(pPanelID),
                clearStorage    = DOM.getByClass('clear-storage', lPanel)[0],
                refresh         = DOM.getByClass('refresh-icon', lPanel)[0],
                a               = DOM.getByTag('a', lPanel),
                
                fileClick       = function (event) {
                    var ctrl = event.ctrlKey;
                    
                    if (!ctrl)
                        DOM.preventDefault(event);
                },
                
                /* right mouse click function varible */
                lOnContextMenu_f = function(pEvent) {
                    var target,
                        isFunc      = Util.isFunction(CloudCmd.Menu),
                        ret         = true,
                        Key         = CloudCmd.Key;
                    
                    Key && Key.unsetBind();
                    
                    /* getting html element
                     * currentTarget - DOM event
                     * target        - jquery event
                     */
                    target = pEvent.currentTarget || pEvent.target;
                    DOM.setCurrentFile(target);
                    
                    if (isFunc) {
                        CloudCmd.Menu({
                            x: pEvent.clientX,
                            y: pEvent.clientY
                        });
                        
                        /* disabling browsers menu*/
                        ret = false;
                        DOM.Images.showLoad();
                    }        
                    
                    return ret;
                },
                
                /* drag and drop function varible
                 * download file from browser to descktop
                 * in Chrome (HTML5)
                 */
                lOnDragStart_f = function(pEvent) {
                    var lElement    = pEvent.target,
                        EXT         = 'json',
                        isDir       = Info.isDir,
                        lLink       = lElement.href,
                        lName       = lElement.textContent;
                    
                    /* if it's directory - adding json extension */
                    if (isDir) {
                        lName       += '.' + EXT;
                        lLink       += '?' + EXT;
                    }
                    
                    pEvent.dataTransfer.setData('DownloadURL',
                        'application/octet-stream'  + ':' +
                        lName                       + ':' + 
                        lLink);
                },
                
                lSetCurrentFile_f = function(pEvent) {
                    var pElement    = pEvent.target,
                        lTag        = pElement.tagName;
                    
                    if (lTag !== 'LI')
                        do {
                            pElement    = pElement.parentElement;
                            lTag        = pElement.tagName;
                        } while(lTag !== 'LI');
                    
                    DOM.setCurrentFile(pElement);
                },
                
                lUrl                = CloudCmd.HOST,
                lLoadDirOnce        = CloudCmd.loadDir();
            
            /* ставим загрузку гифа на клик*/
            Events.addClick(CloudCmd.refresh, refresh);
            Events.addClick(Storage.clear, clearStorage);
            
            /* start from 1 cous 0 is a refresh and it's setted up */
            for(var i = 1, n = a.length; i < n ; i++) {
                var ai              = a[i],
                    lLink           = Util.removeStr(ai.href, lUrl),
                    lLoadDir        = CloudCmd.loadDir(lLink),
                    lLi             = ai.parentElement.parentElement;
                
                /* if we in path - set click event */
                if (lLi.className === 'path')
                    Events.addClick(lLoadDir, ai);
                else {
                    Events.add({
                        'mousedown'     : lSetCurrentFile_f,
                        'contextmenu'   : lOnContextMenu_f,
                        'dragstart'     : lOnDragStart_f
                        }, lLi);
                    
                    /* если ссылка на папку, а не файл */
                    if (ai.target === '_blank')
                        Events.add({
                            'click'     : fileClick
                        });
                    else {
                        Events.add({
                            'dblclick'  : lLoadDirOnce,
                            'touchend'  : lLoadDirOnce,
                            'click'     : DOM.preventDefault,
                            }, lLi);
                    }
                    
                    lLi.id = (ai.title ? ai.title : ai.textContent) +
                        '(' + pPanelID + ')';
                }
            }
        };
        
        function appStorage() {
            getConfig(function(config) {
                var isAppStorage  = config.appStorage,
                    appStorage    = window.applicationStorage;
                
                if (isAppStorage && appStorage)
                    Events.add('updateready', function() {
                        var ret = confirm('An update is available. Reload now?');
                        
                        if (ret)
                            location.reload();
                    
                    }, appStorage);
                });
        }
        
        function contextMenu() {
            Events.addContextMenu(function(pEvent) {
                CloudCmd.Menu.ENABLED || DOM.preventDefault(pEvent);
            }, document);
        }
        
        function dragndrop() {
            var panels          = DOM.getByClass('panel'),
                i               = 0,
                n               = panels.length,
                preventDefault  = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                },
                toggle          = function () {
                    for (i = 0; i < n; i++)
                        DOM.toggleClass(panels[i], 'selected-panel');
                },
                onDrop          = function (event) {
                    var reader, file, files,
                         dir    = Info.dirPath,
                         load   = function(file) {
                            return function(event) {
                                var path    = dir + file.name,
                                    data    = event.target.result;
                                
                                DOM.RESTful.save(path, data, CloudCmd.refresh);
                            };
                        };
                    
                    preventDefault(event);
                    toggle();
                    
                    files               = event.dataTransfer.files;
                    
                    if (files.length) {
                        n               = files.length;
                        
                        for (i = 0; i < n; i++) {
                            reader          = new FileReader();
                            file            = files[i];
                            Events.add('load', load(file), reader);
                            reader.readAsArrayBuffer(file);
                        }
                    }
                };
                
            Events.add(['dragenter', 'dragleave'], toggle);
            
            for (i = 0; i < n; i++) {
                Events.add('dragover', preventDefault, panels[i]);
                Events.add('drop', onDrop, panels[i]);
            }
        }
        
        function unload() {
            DOM.Events.add(['unload', 'beforeunload'], function (pEvent) {
                var lRet, 
                    Key     = CloudCmd.Key,
                    lIsBind = Key && Key.isBind();
                
                if (!lIsBind) {
                    DOM.preventDefault(pEvent);
                    lRet = 'Please make sure that you saved all work.';
                }
                
                return lRet;
            });
        }
        
        function pop() {
            Events.add("popstate", function(pEvent) {
                var lPath   = pEvent.state + '?json';
                
                if (pEvent.state) {
                    lPath   = pEvent.state + '?json';
                    CloudCmd.ajaxLoad(lPath, {nohistory: true});
                } else
                    CloudCmd.route(location.hash);
                
                return true;
            });
        }
        
        function online() {
            var cssSet = Util.retFunc(DOM.cssSet, {
                    id      :'local-droids-font',
                    element : document.head,
                    inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                                'font-style: normal;font-weight: normal;'               +
                                'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                                ' url("/font/DroidSansMono.woff") format("woff");}'
                });
            
            if (navigator.onLine)
                Events.addOnce('offline', cssSet);
            else
                cssSet();
        }
        
     }
    
})(Util, DOM);
