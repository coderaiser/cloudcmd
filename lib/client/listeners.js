var Util, DOM, CloudCmd;

(function (Util, DOM) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(CloudCmd, Util, DOM);
     
     function ListenersProto(CloudCmd, Util, DOM) {
        var Info                = DOM.CurrentInfo,
            Storage             = DOM.Storage,
            Events              = DOM.Events,
            getConfig           = CloudCmd.getConfig,
            OnPathLinks         = [],
            EventsFiles         = {
                'mousedown'     : Util.exec.with(execIfNotUL, setCurrentFileByEvent),
                'contextmenu'   : onContextMenu,
                'dragstart'     : Util.exec.with(execIfNotUL, onDragStart),
                'click'         : onClick,
                'dblclick'      : Util.exec.with(execIfNotUL, onDblClick),
                'touchstart'    : Util.exec.with(execIfNotUL, onTouch)
            };
        
        this.analytics          = function() {
            getConfig(function(config) {
                var analytics   = config.analytics,
                    online      = config.online;
                    
                if (analytics && online) {
                    Events.addOnce('mousemove', function() {
                        var FIVE_SECONDS    = 5000,
                            url             = CloudCmd.LIBDIRCLIENT + 'analytics.js';
                        
                        setTimeout(function() {
                            DOM.jsload(url);
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
            mousemove();
        };
        
        this.initKeysPanel          = function() {
            var keysElement     = DOM.getById('js-keyspanel');
            
            if (keysElement)
                Events.addClick(function(event) {
                    var element = event.target,
                        id      = element.id,
                        
                        clickFuncs      = {
                            'f1'        : CloudCmd.Help.show,
                            'f3'        : CloudCmd.View.show,
                            'f4'        : CloudCmd.Edit.show,
                            'f9'        : CloudCmd.Menu.show,
                            'f10'       : CloudCmd.Config.show,
                            '~'         : CloudCmd.Console.show,
                            'contact'   : CloudCmd.Contact.show,
                            
                            'f2'        : DOM.renameCurrent,
                            'f5'        : DOM.copyFiles,
                            'f6'        : DOM.moveFiles,
                            'f7'        : DOM.promptNewDir,
                            'f8'        : DOM.promptDelete
                        },
                        
                        func    = clickFuncs[id];
                    
                    Util.exec(func);
                    
                }, keysElement);
        };
        
        this.setOnPanel             = function(panelId) {
            var panel           = DOM.getById(panelId),
                filesElement    = DOM.getByDataName('js-files', panel),
                pathElement     = DOM.getByDataName('js-path', panel),
                pathLinks       = DOM.getByDataName('js-links', pathElement),
                clearStorage    = DOM.getByDataName('js-clear-storage', pathElement),
                refresh         = DOM.getByDataName('js-refresh', pathElement),
                loadDir         = function(params, event) {
                    CloudCmd.loadDir(params);
                    event.preventDefault();
                };
            
            /* ставим загрузку гифа на клик*/
            Events.addClick(onRefreshClick, refresh);
            Events.addClick(Storage.clear, clearStorage);
            
            Util.forEach(pathLinks.children, function(ai) {
                var url             = CloudCmd.HOST,
                    link        = Util.rmStr(ai.href, url),
                    load        = Util.exec.with(loadDir, {
                        path        : link,
                        isRefresh   : false,
                        panel       : panel
                    });
                
                Events.addClick(load, ai);
                OnPathLinks.push(load);
            });
            
            Events.add(EventsFiles, filesElement);
        };
        
        this.unSetOnPanel             = function(panelId) {
            var panel           = DOM.getById(panelId),
                filesElement    = DOM.getByDataName('js-files', panel),
                pathElement     = DOM.getByDataName('js-path', panel),
                pathLinks       = DOM.getByDataName('js-links', pathElement),
                clearStorage    = DOM.getByDataName('js-clear-storage', pathElement),
                refresh         = DOM.getByDataName('js-refresh', pathElement);
            
            /* ставим загрузку гифа на клик*/
            Events.rmClick(onRefreshClick, refresh);
            Events.rmClick(Storage.clear, clearStorage);
            
            Util.forEach(pathLinks.children, function(ai) {
                var loadDir     = OnPathLinks.shift();
                Events.rmClick(loadDir, ai);
            });
            
            Events.remove(EventsFiles, filesElement);
        };
        
        /**
         * функция меняет ссыки на ajax-овые 
         * @param panelId
         */
        this.changeLinks            = function(panelId) {
            var i, n, a, ai, current, id,
                panel           = DOM.getById(panelId),
                filesElement    = DOM.getByDataName('js-files', panel),
                files           = filesElement.children;
            
            a = DOM.getByTag('a', filesElement);
            
            n = a.length;
            for (i = 0; i < n ; i++) {
                current     = files[i];
                ai          = a[i];
                
                if (ai.title)
                    id      = ai.title;
                else
                    id      = ai.textContent;
                
                id          += '(' + panelId + ')';
                
                current.id  = id;
            }
        };
        
        function mousemove() {
            DOM.Events.add('mousemove', function(event) {
                var position    = CloudCmd.MousePosition,
                    x           = event.clientX,
                    y           = event.clientY;
                
                position.x      = x;
                position.y      = y;
            });
        }
        
        function execIfNotUL(callback, event) {
            var element = event.target,
                tag     = element.tagName;
            
            if (tag !== 'UL')
                Util.exec(callback, event);
        }
        
        function onClick(event) {
            var ctrl    = event.ctrlKey;
                
            if (!ctrl)
                DOM.preventDefault(event);
            
            changePanel(event.target);
        }
        
        function changePanel(element) {
            var panel   = DOM.getPanel(),
                files   = DOM.getByDataName('js-files', panel),
                ul      = getULElement(element);
            
            if (ul !== files)
                DOM.changePanel();
        }
        
        function onDblClick(event) {
            var current     = getLIElement(event.target),
                isDir       = DOM.isCurrentIsDir(current);
            
            if (isDir) {
                CloudCmd.loadDir();
                DOM.preventDefault(event);
            }
        }
        
        function onTouch(event) {
            var isCurrent,
                element     = getLIElement(event.target),
                isDir       = DOM.isCurrentIsDir(element);
            
            if (isDir) {
                isCurrent   = DOM.isCurrentFile(element);
                
                if (isCurrent) {
                    CloudCmd.loadDir();
                    DOM.preventDefault(event);
                }
            }
        }
        
        function onContextMenu(event) {
            var element = event.target,
                tag     = element.tagName,
                isUL    = tag === 'UL';
            
            if (!isUL) {
                element     = getLIElement(event.target);
                DOM.setCurrentFile(element);
            }
            
            Util.exec(CloudCmd.Menu, {
                x: event.clientX,
                y: event.clientY
            });
            
            changePanel(element);
        }
        
         /* 
          * download file from browser to desktop
          * in Chrome (HTML5)
          */
        function onDragStart(event) {
            var element     = getLIElement(event.target),
                EXT         = 'json',
                isDir       = Info.isDir,
                link        = DOM.getCurrentLink(element),
                name        = DOM.getCurrentName(element);
            
            /* if it's directory - adding json extension */
            if (isDir) {
                name       += '.' + EXT;
                link       += '?' + EXT;
            }
            
            event.dataTransfer.setData('DownloadURL',
                'application/octet-stream'  + ':' +
                name                        + ':' + 
                link);
        }
        
        function onRefreshClick(event) {
            CloudCmd.refresh();
            event.preventDefault();
        }
        
        function getLIElement(element) {
            var tag     = element.tagName;
            
            if (tag !== 'LI')
                do {
                    element     = element.parentElement;
                    tag         = element.tagName;
                } while(tag !== 'LI');
            
            return element;
        }
        
        function getULElement(element) {
            var tag     = element.tagName;
            
            if (tag !== 'UL')
                do {
                    element     = element.parentElement;
                    tag         = element.tagName;
                } while(tag !== 'UL');
            
            return element;
        }
        
        function setCurrentFileByEvent(event) {
            var element = getLIElement(event.target);
            DOM.setCurrentFile(element);
        }
        
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
            Events.addContextMenu(function(event) {
                CloudCmd.Menu.ENABLED || DOM.preventDefault(event);
            }, document);
        }
        
        function dragndrop() {
            var panels          = DOM.getByClassAll('panel'),
                preventDefault  = function (event) {
                    event.preventDefault();
                },
                toggle          = function () {
                    Util.forEach(panels, function(panel) {
                        DOM.toggleClass(panel, 'selected-panel');
                    });
                },
                onDrop          = function (event) {
                    var files,
                        func    = CloudCmd.refresh,
                         dir    = Info.dirPath,
                         load   = function(file, callback) {
                            var Images  = DOM.Images,
                                name    = file.name,
                                path    = dir + name;
                                
                                Images.showLoad({top: true});
                                Images.setProgress(0, name);
                                
                                DOM.RESTful.write(path, file, callback);
                        };
                    
                    preventDefault(event);
                    toggle();
                    
                    files   = event.dataTransfer.files;
                    
                    if (files.length) {
                        Util.forEach(files, function(file) {
                            func        = Util.exec.with(load, file, func);
                        });
                        
                        func();
                    }
                };
                
            Events.add(['dragenter', 'dragleave'], toggle);
            
            Util.forEach(panels, function(panel) {
                Events.add('dragover', preventDefault, panel);
                Events.add('drop', onDrop, panel);
            });
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
            Events.add('popstate', function(event) {
                var path = event.state;
                
                if (path)
                    CloudCmd.loadDir({
                        path     : path,
                        nohistory: true
                    });
                else
                    CloudCmd.route(location.hash);
            });
        }
        
        function online() {
            var cssSet = DOM.cssSet.bind(null, {
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
