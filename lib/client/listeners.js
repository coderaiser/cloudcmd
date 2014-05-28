var Util, DOM, CloudCmd;

(function (Util, DOM) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(CloudCmd, Util, DOM);
     
     function ListenersProto(CloudCmd, Util, DOM) {
        var Info                = DOM.CurrentInfo,
            Storage             = DOM.Storage,
            Events              = DOM.Events,
            getConfig           = CloudCmd.getConfig,
            EventsFiles         = {
                'mousedown'     : Util.exec.with(execIfNotUL, setCurrentFileByEvent),
                'contextmenu'   : onContextMenu,
                'click'         : onClick,
                'dragstart'     : Util.exec.with(execIfNotUL, onDragStart),
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
                            DOM.load.js(url);
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
                Events.addClick(keysElement, function(event) {
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
                    
                });
        };
        
        this.setOnPanel             = function(panelId) {
            var panel           = DOM.getById(panelId),
                filesElement    = DOM.getByDataName('js-files', panel),
                pathElement     = DOM.getByDataName('js-path', panel);
            
            /* ставим загрузку гифа на клик*/
            Events.addClick(pathElement, onPathElementClick);
            Events.add(filesElement, EventsFiles);
        };
        
        function onPathElementClick(event) {
            var link, href, url,
                element     = event.target,
                attr        = element.getAttribute('data-name');
            
            switch (attr) {
            case 'js-clear-storage':
                Storage.clear();
                break;
            
            case 'js-refresh':
                CloudCmd.refresh();
                event.preventDefault();
                break;
            
            case 'js-path-link':
                url         = CloudCmd.HOST;
                href        = element.href;
                link        = Util.rmStr(href, url);
                
                CloudCmd.loadDir({
                    path        : link,
                    isRefresh   : false
                });
                
                event.preventDefault();
            }
        }
        
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
        
        function getLIElement(element) {
            if (element)
                while (element.tagName !== 'LI')
                    element = element.parentElement;
            
            return element;
        }
        
        function getULElement(element) {
            while (element.tagName !== 'UL')
                element     = element.parentElement;
            
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
                    Events.add('updateready', appStorage, function() {
                        var ret = confirm('An update is available. Reload now?');
                        
                        if (ret)
                            location.reload();
                    
                    });
                });
        }
        
        function contextMenu() {
            Events.addContextMenu(document, function(event) {
                CloudCmd.Menu.ENABLED || DOM.preventDefault(event);
            });
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
                Events.add('dragover', panel, preventDefault)
                      .add('drop', panel, onDrop);
            });
        }
        
        function unload() {
            DOM.Events.add(['unload', 'beforeunload'], function (event) {
                var ret, 
                    Key     = CloudCmd.Key,
                    isBind  = Key && Key.isBind();
                
                if (!isBind) {
                    DOM.preventDefault(event);
                    ret = 'Please make sure that you saved all work.';
                }
                
                return ret;
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
            var cssSet = DOM.load.style.bind(null, {
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
