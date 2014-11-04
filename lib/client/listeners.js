var Util, DOM, CloudFunc, CloudCmd;

(function (Util, DOM, CloudFunc, CloudCmd) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(Util, DOM, CloudFunc, CloudCmd);
     
     function ListenersProto(Util, DOM, CloudFunc, CloudCmd) {
        var Info                = DOM.CurrentInfo,
            Storage             = DOM.Storage,
            Events              = DOM.Events,
            Files               = DOM.Files,
            EventsFiles         = {
                'mousedown'     : Util.exec.with(execIfNotUL, setCurrentFileByEvent),
                'contextmenu'   : onContextMenu,
                'click'         : onClick,
                'dragstart'     : Util.exec.with(execIfNotUL, onDragStart),
                'dblclick'      : Util.exec.with(execIfNotUL, onDblClick),
                'touchstart'    : Util.exec.with(execIfNotUL, onTouch)
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
                            '~'         : CloudCmd.Konsole.show,
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
                /* 
                 * browser do not replace % -> %25%
                 * do it for him
                 */
                link        = Util.replaceStr(link, '%%', '%25%');
                link        = decodeURI(link);
                link        = Util.rmStrOnce(link, CloudFunc.FS) || '/';
                
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
                Events.preventDefault(event);
            
            changePanel(event.target);
        }
        
        function changePanel(element) {
            var panel   = Info.panel,
                files   = DOM.getByDataName('js-files', panel),
                ul      = getULElement(element);
                
            if (ul !== files)
                DOM.changePanel();
        }
        
        function onDblClick(event) {
            var current     = getLIElement(event.target),
                isDir       = DOM.isCurrentIsDir(current),
                path        = DOM.getCurrentPath(current);
            
            path    = CloudFunc.rmLastSlash(path);
            
            if (isDir) {
                CloudCmd.loadDir({
                    path: path
                });
                
                Events.preventDefault(event);
            }
        }
        
        function onTouch(event) {
            var isCurrent,
                current     = getLIElement(event.target),
                isDir       = DOM.isCurrentIsDir(current);
            
            if (isDir) {
                isCurrent   = DOM.isCurrentFile(current);
                
                if (isCurrent) {
                    CloudCmd.loadDir({
                        path: DOM.getCurrentPath(current)
                    });
                    
                    Events.preventDefault(event);
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
            Files.get('config', function(error, config) {
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
                CloudCmd.Menu.ENABLED || Events.preventDefault(event);
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
                    var files   = event.dataTransfer.files;
                    
                    preventDefault(event);
                    DOM.uploadFiles(files);
                };
                
            Events.add(['dragenter', 'dragleave', 'drop'], toggle);
            
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
                    Events.preventDefault(event);
                    ret = 'Please make sure that you saved all work.';
                }
                
                return ret;
            });
        }
        
        function pop() {
            Events.add('popstate', function(event) {
                var path    = event.state;
                
                path        = Util.rmStrOnce(path, CloudFunc.FS);
                
                if (path)
                    CloudCmd.loadDir({
                        path        : path,
                        history     : false
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
    
})(Util, DOM, CloudFunc, CloudCmd);
