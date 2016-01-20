var Util, DOM, CloudFunc, CloudCmd;

(function (Util, DOM, CloudFunc, CloudCmd) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(Util, DOM, CloudFunc, CloudCmd);
     
     function ListenersProto(Util, DOM, CloudFunc, CloudCmd) {
        var Info                = DOM.CurrentInfo,
            Storage             = DOM.Storage,
            Events              = DOM.Events,
            EventsFiles         = {
                'mousedown' : Util.exec.with(execIfNotUL, setCurrentFileByEvent),
                'click'     : onClick,
                'dragstart' : Util.exec.with(execIfNotUL, onDragStart),
                'dblclick'  : Util.exec.with(execIfNotUL, onDblClick),
                'touchstart': Util.exec.with(execIfNotUL, onTouch)
            };
        
        this.init = function () {
            contextMenu();
            dragndrop();
            unload();
            pop();
            resize();
        };
        
        this.initKeysPanel          = function() {
            var keysElement     = DOM.getById('js-keyspanel');
            
            if (keysElement)
                Events.addClick(keysElement, function(event) {
                    var element = event.target,
                        id              = element.id,
                        operation       = function(name) {
                            var Operation = CloudCmd.Operation,
                                fn = Operation.show.bind(null, name);
                            
                            return fn;
                        },
                        
                        clickFuncs      = {
                            'f1'        : CloudCmd.Help.show,
                            'f2'        : DOM.renameCurrent,
                            'f3'        : CloudCmd.View.show,
                            'f4'        : CloudCmd.Edit.show,
                            'f5'        : operation('copy'),
                            'f6'        : operation('move'),
                            'f7'        : DOM.promptNewDir,
                            'f8'        : operation('delete'),
                            'f9'        : CloudCmd.Menu.show,
                            'f10'       : CloudCmd.Config.show,
                            '~'         : CloudCmd.Konsole.show,
                            'contact'   : CloudCmd.Contact.show,
                        },
                        
                        func    = clickFuncs[id];
                    
                    if (func)
                        func();
                });
        };
        
        this.setOnPanel             = function(side) {
            var panel,
                filesElement,
                pathElement;
            
            if (typeof side === 'string')
                panel       = DOM.getByDataName('js-' + side);
            else
                panel       = side;
            
            filesElement    = DOM.getByDataName('js-files', panel);
            pathElement     = DOM.getByDataName('js-path', panel);
            
            /* ставим загрузку гифа на клик*/
            Events.addClick(pathElement, getPathListener(panel));
            Events.add(filesElement, EventsFiles);
        };
        
        function getPathListener(panel) {
            var fn = onPathElementClick.bind(null, panel);
            
            return fn;
        }
        
        function isNoCurrent(panel) {
            var noCurrent,
                infoPanel       = Info.panel,
                namePanel       = panel.getAttribute('data-name'),
                nameInfoPanel   = infoPanel.getAttribute('data-name');
                
            if (namePanel !== nameInfoPanel)
                noCurrent = true;
            
            return noCurrent;
        }
        
        function onPathElementClick(panel, event) {
            var link, href, url,
                noCurrent,
                fs          = CloudFunc.FS,
                prefix      = CloudCmd.PREFIX,
                element     = event.target,
                attr        = element.getAttribute('data-name');
            
            switch (attr) {
            case 'js-clear-storage':
                Storage.clear();
                break;
            
            case 'js-refresh':
                noCurrent = isNoCurrent(panel);
                
                CloudCmd.refresh(panel, {
                    noCurrent: noCurrent
                });
                
                event.preventDefault();
                break;
            
            case 'js-path-link':
                url         = CloudCmd.HOST;
                href        = element.href;
                link        = href.replace(url, '');
                /**
                 * browser doesn't replace % -> %25%
                 * do it for him
                 */
                link        = link.replace('%%', '%25%');
                link        = decodeURI(link);
                link        = link.replace(RegExp('^' + prefix + fs), '') || '/';
                
                noCurrent   = isNoCurrent(panel);
                
                CloudCmd.loadDir({
                    path        : link,
                    isRefresh   : false,
                    panel       : noCurrent ? panel : Info.panel
                });
                
                event.preventDefault();
            }
        }
        
        function execIfNotUL(callback, event) {
            var element = event.target,
                tag     = element.tagName;
            
            if (tag !== 'UL')
                callback(event);
        }
        
        function onClick(event) {
            var ctrl    = event.ctrlKey;
                
            if (!ctrl)
                event.preventDefault();
            
            changePanel(event.target);
        }
        
        function toggleSelect(key, files) {
            var isMac   = /Mac/.test(window.navigator.platform);
            
            if (!key)
                throw Error('key should not be undefined!');
            
            if (isMac && key.meta || key.ctrl)
                DOM.toggleSelectedFile(files[0]);
            else if (key.shift)
                files.forEach(function(current) {
                    if (!DOM.isSelected(current))
                        DOM.toggleSelectedFile(current);
                });
            else
                DOM.unselectFiles();
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
            
            if (isDir) {
                CloudCmd.loadDir({
                    path: path === '/' ? '/' : path + '/'
                });
                
                event.preventDefault();
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
                    
                    event.preventDefault();
                }
            }
        }
        
         /*
          * download file from browser to desktop
          * in Chrome (HTML5)
          */
        function onDragStart(event) {
            var apiURL      = CloudFunc.apiURL,
                element     = getLIElement(event.target),
                EXT         = '.tar.gz',
                isDir       = Info.isDir,
                link        = DOM.getCurrentLink(element),
                name        = DOM.getCurrentName(element);
            
            /* if it's directory - adding json extension */
            if (isDir) {
                name            += EXT;
                link            = document.createElement('a');
                link.textContent   = name;
                link.href          = apiURL + '/pack' + Info.path + EXT;
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
            var fromName,
                toName,
                BUTTON_LEFT = 0,
                files       = [],
                key         = {
                    ctrl: event.ctrlKey,
                    meta: event.metaKey,
                    shift: event.shiftKey
                },
                
                element     = getLIElement(event.target);
            
            fromName = Info.name;
            DOM.setCurrentFile(element);
            toName  = Info.name;
            
         if (key.shift)
                files = getFilesRange(fromName, toName);
            else
                files.push(Info.element);
                
            if (event.button === BUTTON_LEFT)
                toggleSelect(key, files);
        }
        
        function getFilesRange(from, to) {
            var i           = 0,
                delta       = 0,
                result      = [],
                files       = DOM.getFiles(),
                names       = DOM.getFilenames(files),
                indexFrom,
                indexTo;
            
            if (names[0] === '..') {
                names.shift();
                delta = 1;
            }
            
            indexFrom   = names.indexOf(from);
            indexTo     = names.indexOf(to);
            
            if (indexFrom < indexTo)
                for (i = indexFrom; i <= indexTo; i++)
                    result.push(files[i + delta]);
            else if (indexFrom > indexTo)
                for (i = indexFrom; i >= indexTo; i--)
                    result.push(files[i + delta]);
            else
                result.push(to);
            
            return result;
        }
        
        function contextMenu() {
            var fm = DOM.getFM();
            
            Events.addOnce('contextmenu', fm, function(event) {
                CloudCmd.Menu.show({
                    x: event.clientX,
                    y: event.clientY
                });
            });
            
            Events.addContextMenu(fm, function(event) {
                CloudCmd.Menu.ENABLED || event.preventDefault();
            });
        }
        
        function dragndrop() {
            var panels          = DOM.getByClassAll('panel'),
                forEach         = Array.prototype.forEach,
                
                select          = function() {
                    forEach.call(panels, function(panel) {
                        panel.classList.add('selected-panel');
                    });
                },
                
                unselect        = function() {
                    forEach.call(panels, function(panel) {
                        panel.classList.remove('selected-panel');
                    });
                },
                onDrop          = function(event) {
                    var files   = event.dataTransfer.files,
                        items   = event.dataTransfer.items;
                    
                    event.preventDefault();
                    
                    if (items && items.length && items[0].webkitGetAsEntry) {
                        files = [].filter.call(items, function(item) {
                            return item.kind === 'file';
                        });
                        
                        DOM.uploadDirectory(files);
                    } else {
                        DOM.uploadFiles(files);
                    }
                },
                /**
                 * In Mac OS Chrome dropEffect = 'none'
                 * so drop do not firing up when try
                 * to upload file from download bar
                 */
                onDragOver      = function(event) {
                    var dataTransfer    = event.dataTransfer,
                        effectAllowed   = dataTransfer.effectAllowed;
                    
                    if (/move|linkMove/.test(effectAllowed))
                        dataTransfer.dropEffect = 'move';
                    else
                        dataTransfer.dropEffect = 'copy';
                    
                    event.preventDefault();
                };
                
            Events.add('dragenter', select);
            Events.add(['dragleave', 'drop'], unselect);
            
            forEach.call(panels, function(panel) {
                Events.add('dragover', panel, onDragOver)
                      .add('drop', panel, onDrop);
            });
        }
        
        function unload() {
            DOM.Events.add(['unload', 'beforeunload'], function (event) {
                var ret,
                    Key     = CloudCmd.Key,
                    isBind  = Key && Key.isBind();
                
                if (!isBind) {
                    event.preventDefault();
                    ret = 'Please make sure that you saved all work.';
                }
                
                return ret;
            });
        }
        
        function pop() {
            Events.add('popstate', function(event) {
                var path    = event.state || '';
                
                path        = path.replace(CloudFunc.FS, '');
                
                if (!path)
                    CloudCmd.route(location.hash);
                else
                    CloudCmd.loadDir({
                        path        : path,
                        history     : false
                    });
            });
        }
        
        function resize() {
            Events.add('resize', function() {
                var name, isLeft,
                    is      = window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH,
                    panel   = Info.panel;
                
                if (panel) {
                    name    = panel.getAttribute('data-name'),
                    isLeft  = name === 'js-left';
                }
                
                if (is && !isLeft)
                    DOM.changePanel();
            });
        }
        
     }
    
})(Util, DOM, CloudFunc, CloudCmd);
