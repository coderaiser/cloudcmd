var CloudCmd, Util, DOM, CloudFunc, Dialog;

(function(Util) {
    'use strict';
    
    var DOMFunc                     = function() {},
        DOMProto,
        
        DialogProto                 = function() {
            this.alert      = alert.bind(window);
            this.prompt     = prompt.bind(window);
            this.confirm    = confirm.bind(window);
        },
        
        ImagesProto                 = function() {
            var Images,
                ImageElementProto   = function() {
                    var LOADING         = 'loading',
                        LoadingImage,
                        HIDDEN          = 'hidden',
                        ERROR           = 'error';
                    
                    function init() {
                        if (!LoadingImage) {
                            LoadingImage    = LOADING;
                            
                            if (DOM.isSVG())
                                LoadingImage += '-svg';
                            else
                                LoadingImage += '-gif';
                        }
                    }
                    
                    function getElement() {
                        var element;
                        
                        init();
                        
                        element = DOM.anyload({
                            name        : 'span',
                            id          : 'js-status-image',
                            className   : 'icon',
                            attr        : 'data-progress',
                            not_append  : true
                        });
                        
                        return element;
                    }
                    
                    this.get        = getElement;
                    
                    /* Функция создаёт картинку загрузки */
                    this.loading    = function() {
                        var element = getElement();
                        
                        DOM.addClass(element, LOADING)
                           .addClass(element, LoadingImage)
                           .removeClass(element, ERROR)
                           .removeClass(element, HIDDEN);
                        
                        return element;
                    };
                    
                    /* Функция создаёт картинку ошибки загрузки */
                    this.error      = function() {
                        var element = getElement();
                        
                        DOM.addClass(element, ERROR)
                           .removeClass(element, LOADING)
                           .removeClass(element, LoadingImage)
                           .removeClass(element, HIDDEN);
                          
                        return element;
                    };
            };
            
            Images = new ImageElementProto();
            /** 
             * Function shows loading spinner
             * pPosition = {top: true};
             */   
            this.showLoad = function(position) {
                var top             = position && position.top,
                    current,
                    image           = Images.loading(),
                    parent          = image.parentElement;
                
                if (top)
                    current         = DOM.getRefreshButton().parentElement;
                else {
                    current         = DOM.getCurrentFile();
                    current         = DOM.getByClass('name', current);
                }
                
                if (!parent || (parent && parent !== current))
                    current.appendChild(image);
                
                DOM.show(image);
                
                return image;
            };
            
            /**
             * hide load image
             */
            this.hide       = function() {
                DOM.hide(Images.loading());
            };
            
            /**
             * show error image (usualy after error on ajax request)
             */
            this.showError = function(jqXHR) {
                var isStr           = Util.isString(jqXHR),
                    image           = Images.error(),
                    response        = '',
                    statusText      = '',
                    status          = 0,
                    text            = '';
                            
                if (jqXHR)
                    if (isStr) {
                        text = jqXHR;
                    } else {
                        response       = jqXHR.responseText;
                        statusText     = jqXHR.statusText;
                        status         = jqXHR.status;
                        text           = status === 404 ? response : statusText;
                    }
                
                DOM.show(image);
                image.title = text;
                
                if (text)
                    setTimeout(function() {
                        Dialog.alert(text);
                        Util.log(text);
                    }, 100);
                
                return image;
            };
            
            this.setProgress    = function(value, title) {
                var DATA    = 'data-progress',
                    element = Images.get();
                    
                if (element) {
                    element.setAttribute(DATA, value + '%');
                    
                    if (title)
                        element.title = title;
                }
            };
                
            this.clearProgress  = function() {
                var DATA    = 'data-progress',
                    element = Images.get();
                    
                 if (element) {
                    element.setAttribute(DATA, '');
                    element.title = '';
                }
            };
        },
        
        DOMTreeProto                = function() {
            var DOM                     = this;
            /**
             * add class to element
             * 
             * @param element
             * @param pClass
             */
            this.addClass                = function(element, pClass) {
               var ret        = element && pClass;
                
                if (ret)
                   element.classList.add(pClass);
                
                return this;
            };
            
            /**
             * remove class pClass from element element
             * @param element
             * @param pClass
             */
            this.removeClass             = function(element, pClass) {
                var ret        = element && pClass;
                
                if (ret)
                   element.classList.remove(pClass);
                
                return this;
            };
            
            this.toggleClass             = function(element, pClass) {
                var ret        = element && pClass;
                
                if (ret)
                   element.classList.toggle(pClass);
                
                return this;
            };
            
            /**
             * check class of element
             * 
             * @param element
             * @param pClass
             */
            this.isContainClass          = function(element, pClass) {
                var ret,
                    lClassList = element && element.classList;
                    
                if (lClassList )
                    ret = lClassList.contains(pClass);
                    
                return ret;
            };
            
            /**
             * Function search element by tag
             * @param pTag - className
             * @param element - element
             */
            this.getByTag                = function(pTag, element) {
                return (element || document).getElementsByTagName(pTag);
            };
            
            /**
             * Function search element by id
             * @param Id - id
             */
            this.getById                = function(pId) {
                return document.getElementById(pId);
            };
            
            /**
             * Function search first element by class name
             * @param pClass - className
             * @param element - element
             */
            this.getByClass             = function(pClass, elementParam) {
                var element = elementParam || document,
                    ret     = this.getByClassAll(pClass, element)[0];
                
                return ret;
            };
            
            this.getByDataName          = function(attribute, element) {
                var ret,
                    selector    = '[' + 'data-name="' + attribute + '"]';
                
                if (!element)
                    element     = document;
                
                ret             = element.querySelector(selector);
                
                return ret;
            };
            
            /**
             * Function search element by class name
             * @param pClass - className
             * @param element - element
             */
            this.getByClassAll          = function(pClass, element) {
                return (element || document).getElementsByClassName(pClass);
            };
            
            /**
             * check SVG SMIL animation support
             */
            this.isSVG                  = function() {
                var ret, svgNode, name,
                    create  = document.createElementNS,
                    SVG_URL = 'http://www.w3.org/2000/svg';
                
                if (create) {
                    create  = create.bind(document);
                    svgNode = create(SVG_URL, 'animate');
                    name    = svgNode.toString();
                    ret     = /SVGAnimate/.test(name);
                }
                
                return ret;
            };
            
            /**
             * add class=hidden to element
             * 
             * @param element
             */
            this.hide                    = function(element) {
                return DOM.addClass(element, 'hidden');
            };
            
            this.show                    = function(element) {
                return DOM.removeClass(element, 'hidden');
            };
        },
        
        EventsProto                 = function() {
            var Events  = this,
                ADD     = true,
                REMOVE  = false,
                process = function(pAdd, type, listener, elementParam, useCapture) {
                    var i, n, 
                        element        = (elementParam || window),
                        
                        eventProcess   =  pAdd ?
                            element.addEventListener :
                            element.removeEventListener,
                        
                        ret            = type && eventProcess,
                        event          = '';
                    
                    eventProcess       = eventProcess.bind(element);
                    
                    if (ret) {
                        if (Util.isString(type))
                            eventProcess(
                                type,
                                listener,
                                useCapture
                            );
                        else if (Util.isArray(type))
                            for (i = 0, n = type.length; i < n; i++)
                                process(
                                    pAdd,
                                    type[i],
                                    listener,
                                    element,
                                    useCapture
                                );
                        else if (Util.isObject(type)) {
                            if (listener)
                                element = listener;
                            
                            for (event in type)
                                process(
                                    pAdd,
                                    event,
                                    type[event],
                                    element,
                                    useCapture
                                );
                        }
                    }
                };
            
            /**
             * safe add event listener
             * 
             * @param type
             * @param listener
             * @param useCapture
             * @param element {document by default}
             */
            this.add                        = function(type, listener, element, useCapture) {
                return process(
                    ADD,
                    type,
                    listener,
                    element,
                    useCapture
                );
            };
            
            /**
             * safe add event listener
             * 
             * @param type
             * @param listener
             * @param useCapture
             * @param element {document by default}
             */
            this.addOnce                    = function(type, listener, element, useCapture) {
                var ret        = this,
                    lOneTime    = function (pEvent) {
                        ret.remove(type, lOneTime, element, useCapture);
                        listener(pEvent);
                    };
                
                this.add(type, lOneTime, element, useCapture);
                
                return ret;
            };
            
            /**
             * safe remove event listener
             * 
             * @param type
             * @param listener
             * @param useCapture
             * @param element {document by default}
             */
            this.remove                     = function(type, listener, element, useCapture) {
               return process(
                    REMOVE,
                    type,
                    listener,
                    element,
                    useCapture
                );
            };
            
            
            /**
             * safe add event keydown listener
             * 
             * @param listener
             * @param useCapture
             */
            this.addKey                     = function(listener, element, useCapture) {
                return this.add('keydown', listener, element, useCapture);
            };
            
            /**
             * safe remove event click listener
             * 
             * @param listener
             * @param useCapture
             */
            this.rmKey                      = function(listener, element, useCapture) {
                return this.remove('keydown', listener, element, useCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param listener
             * @param useCapture
             */
            this.addClick                   = function(listener, element, useCapture) {
                return this.add('click', listener, element, useCapture);
            };
            
            /**
             * safe remove event click listener
             * 
             * @param listener
             * @param useCapture
             */
            this.rmClick                   = function(listener, element, useCapture) {
                return this.remove('click', listener, element, useCapture);
            };
            
            this.addContextMenu             = function(listener, element, useCapture) {
                return this.add('contextmenu', listener, element, useCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param listener
             * @param useCapture
             */
            this.addError                   = function(listener, element, useCapture) {
                return this.add('error', listener, element, useCapture);
            };
            
            /**
             * crossbrowser create event
             * 
             * @param pEventName
             * @param pKeyCode - not necessarily
             */
            this.create                     = function(pEventName, pKeyCode) {
                var event = document.createEvent('Event');
                
                event.initEvent(pEventName, true, true);
                
                if (pKeyCode)
                    event.keyCode = pKeyCode;
                
                event.isDefaultPrevented = function() {
                    return this.defaultPrevented;
                };
                
                return event;
            };
            
            
            /**
             * create keydown event
             * 
             * @param pKeyCode
             */
            this.createKey                  = function(pKeyCode) {
                return this.create('keydown', pKeyCode);
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createClick                = function() {
                return this.create('click');
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createDblClick             = function() {
                return this.create('dblclick');
            };
            
            /**
             * dispatch event
             * 
             * @param pEvent
             */
            this.dispatch                   = function(pEvent, element) {
                var event;
                
                if (Util.isString(pEvent))
                    event = Events.create(pEvent);
                else
                    event = pEvent;
                
                return (element || window).dispatchEvent(event);
            };
            
            /**
             * dispatch keydown event
             * 
             * @param pKeyCode
             * @param element
             */
            this.dispatchKey                = function(pKeyCode, element) {
                var event  = this.createKey(pKeyCode),
                    ret    = this.dispatch(event, element);
                
                return ret;
            };
            
            /**
             * dispatch click event
             * 
             * @param element
             */
            this.dispatchClick              = function(element) {
                var event  = this.createClick(),
                    ret    = this.dispatch(event, element);
                
                return ret;
            };
            
            /**
             * dispatch dblclick event
             * 
             * @param element
             */
            this.dispatchDblClick           = function(element) {
                var event  = this.createDblClick(),
                    ret    = this.dispatch(event, element);
                
                return ret;
            };
        },
        
        CmdProto                    = function() {
            var Cmd                     = this,
                CurrentInfo             = {},
                CURRENT_FILE            = 'current-file',
                SELECTED_FILE           = 'selected-file',
                SelectType              = '*.*',
                Title,
                TabPanel   = {
                    'js-left'        : null,
                    'js-right'       : null
                };
            
            /**
             * private function thet unset currentfile
             * 
             * @currentFile
             */
            function unsetCurrentFile(currentFile) {
                var ret = DOM.isCurrentFile(currentFile);
                
                if (ret)
                    DOM.removeClass(currentFile, CURRENT_FILE);
                
                return ret;
            }
            
              /**
             * load jquery from google cdn or local copy
             * @param callback
             */
            this.jqueryLoad              = function(callback) {
                CloudCmd.getConfig(function(config) {
                    var online = config.online && navigator.onLine;
                    
                    Util.ifExec(!online,
                        function() {
                            DOM.jsload('/lib/client/jquery.js', {
                                onload: callback
                            });
                        },
                        function(func) {
                            DOM.jquery({
                                onload: callback,
                                onerror: func
                            });
                        });
                });
            };
            
            /**
             * create new folder
             *
             */
            this.promptNewDir        = function() {
                promptNew('directory', '?dir');
            };
            
            /**
             * create new file
             *
             * @typeName
             * @type
             */
            this.promptNewFile       = function() {
                 promptNew('file');
            };
            
            function promptNew(typeName, type) {
                var RESTful = DOM.RESTful,
                    lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lMsg    = 'New ' + typeName || 'File',
                    lType   = Util.isString(type) ? type : '';
                
                if (lName === '..')
                    lName = '';
                
                lName       = Dialog.prompt(lMsg, lName);
                
                if (lName)
                    RESTful.write(lDir + lName + lType, null, CloudCmd.refresh);
            }
            
            /**
             * zip file
             *
             */
            this.zipFile      = function() {
                var RESTful     = DOM.RESTful,
                    name        = Cmd.getCurrentName(),
                    dir         = Cmd.getCurrentDirPath(),
                    path        = dir + name,
                    fileFrom    = {
                        from    : path
                    };
                
                if (name && name !== '..')
                    RESTful.zip(fileFrom, CloudCmd.refresh);
            };
            
            /**
             * unzip file
             *
             */
            this.unzipFile      = function() {
                var RESTful     = DOM.RESTful,
                    name        = Cmd.getCurrentName(),
                    dir         = Cmd.getCurrentDirPath(),
                    path        = dir + name,
                    fileFrom    = {
                        from    : path
                    };
                
                if (name && name !== '..')
                    RESTful.unzip(fileFrom, CloudCmd.refresh);
            };
            
            /**
             * prompt and delete current file or selected files
             *
             * @currentFile
             */
            this.promptDelete       = function(currentFile) {
                var ret, type, isDir, msg, current,
                    name        = '',
                    msgAsk      = 'Do you really want to delete the ',
                    msgSel      = 'selected ',
                    files       = Cmd.getSelectedFiles(),
                    names       = Cmd.getSelectedNames(files),
                    i, n        = names && names.length;
                
                if (!Cmd.isCurrentFile(currentFile))
                    current    = DOM.getCurrentFile();
                
                if (n) {
                    for (i = 0; i < 5 && i < n; i++)
                        name += '\n' + names[i];
                    
                    if (n >= 5)
                        name   += '\n...';
                    
                    msg    = msgAsk + msgSel + n + ' files/directoris?\n' + name ;
                } else {
                    isDir       = Cmd.isCurrentIsDir(current);
                    
                    if (isDir)
                        type    ='directory';
                    else
                        type    = 'file';
                     
                     type += ' ';
                    
                    name   = Cmd.getCurrentName(current);
                    msg    = msgAsk + msgSel + type + name + '?';
                }
                
                if (name !== '..')
                    ret  = Dialog.confirm(msg);
                else
                    Dialog.alert('No files selected!');
                
                if (ret)
                    DOM.sendDelete(files);
                
                return ret;
            };
            
            /**
             * delete current or selected files
             *
             * @files
             */
            this.sendDelete         = function(files) {
                var n, names, path,
                    query       = '',
                    RESTful     = DOM.RESTful,
                    current     = CurrentInfo.element,
                    isDir       = DOM.CurrentInfo.isDir;
                    
                if (!files)
                    files       = Cmd.getSelectedFiles();
                
                if (isDir)
                    query  = '?dir';
                
                names       = DOM.getSelectedNames(files),
                n           = names && names.length;
                
                if (n) {
                    path    = Cmd.getCurrentDirPath();
                    query   = '?files';
                } else {
                    path    = Cmd.getCurrentPath(current);
                }
                
                RESTful.delete(path + query, names, function() {
                    var Storage     = DOM.Storage,
                        dirPath     = CurrentInfo.dirPath,
                        dir         = CloudFunc.rmLastSlash(dirPath);
                    
                    if (n > 1)
                        DOM.deleteSelected(files);
                    else
                        DOM.deleteCurrent(current);
                    
                    Storage.removeMatch(dir);
                });
            };
            
            /**
             * get current direcotory name
             */
            this.getCurrentDirName           = function() {
                var ret,
                    lSubstr,
                    /* получаем имя каталога в котором находимся */
                    lHref   = this.getCurrentDirPath();
                
                lHref       = CloudFunc.rmLastSlash(lHref);
                lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
                ret        = Util.removeStrOneTime(lHref, lSubstr + '/') || '/';
                
                return ret;
            };
            
            /**
             * get current direcotory path
             */
            this.getCurrentDirPath       = function(panel) {
                var ret, path;
                
                if (!panel)
                    panel   =  this.getPanel();
                
                path        =  this.getByDataName('js-path', panel);
                ret         = path && path.textContent;
                
                return ret;
            };
            
            /**
             * get current direcotory path
             */
            this.getParentDirPath       = function(panel) {
                var path    = DOM.getCurrentDirPath(panel),
                    dirName = DOM.getCurrentDirName() + '/',
                    ret     = '/';
                
                if (path !== '/')
                    ret = Util.removeStr(path, dirName);
                
                return ret;
            };
            
            /**
             * get not current direcotory path
             */
            this.getNotCurrentDirPath       = function() {
                var panel  = this.getPanel(true),
                    path   = this.getCurrentDirPath(panel);
                
                return path;
            };
            
            /**
             * unified way to get current file
             *
             * @currentFile
             */
            this.getCurrentFile          = function() {
                var ret = this.getByClass(CURRENT_FILE);
                
                return ret;
            };
            
            /**
             * get current file by name
             */
            this.getCurrentFileByName       = function(name) {
                var ret, panel;
                
                panel   = DOM.getPanel();
                name    = name + '(' +  panel.id + ')';
                ret     = DOM.getById(name);
                
                return ret;
            };
            
            /**
             * unified way to get current file
             *
             * @currentFile
             */
            this.getSelectedFiles         = function() {
                var panel       = DOM.getPanel(),
                    selected    = this.getByClassAll(SELECTED_FILE, panel),
                    ret         = Util.slice(selected);
                
                return ret;
            };
            
            /**
             * get size
             * @currentFile
             */
            this.getCurrentSize          = function(currentFile) {
                var ret,
                    current     = currentFile || Cmd.getCurrentFile(),
                    size        = this.getByClass('size', current);
                
                size       = size.textContent;
                /* если это папка - возвращаем слово dir вместо размера*/
                ret        = Util.removeStrOneTime(size, ['<', '>']);
                
                return ret;
            };
            
            /**
             * get size
             * @currentFile
             */
            this.loadCurrentSize          = function(callback, currentFile) {
                var RESTful     = DOM.RESTful,
                    current     = currentFile || this.getCurrentFile(),
                    query       = '?size',
                    link        = this.getCurrentPath(current);
                
                if (name !== '..')
                    RESTful.read(link + query, function(size) {
                        DOM.setCurrentSize(size, current);
                        Util.exec(callback, current);
                    });
            };
            
            /**
             * load hash
             * @callback
             * @currentFile
             */
            this.loadCurrentHash          = function(callback, currentFile) {
                var RESTful     = DOM.RESTful,
                    current     = currentFile || this.getCurrentFile(),
                    query       = '?hash',
                    link        = this.getCurrentPath(current);
                
                RESTful.read(link + query, callback);
            };
            
            /**
             * load current modification time of file
             * @callback
             * @currentFile
             */
            this.loadCurrentTime          = function(callback, currentFile) {
                var RESTful     = DOM.RESTful,
                    current     = currentFile || this.getCurrentFile(),
                    query       = '?time',
                    link        = this.getCurrentPath(current);
                
                RESTful.read(link + query, callback);
            };
            
            /**
             * set size
             * @currentFile
             */
            this.setCurrentSize          = function(size, currentFile) {
                var current         = currentFile || this.getCurrentFile(),
                    sizeElement     = this.getByClass('size', current),
                    sizeShort       = CloudFunc.getShortSize(size);
                
                sizeElement.textContent = sizeShort;
            
            };
            
            /**
             * @currentFile
             */
            this.getCurrentMode          = function(currentFile) {
                var ret,
                    lCurrent    = currentFile || this.getCurrentFile(),
                    lMode       = this.getByClass('mode', lCurrent);
                    ret        = lMode.textContent;
                
                return ret;
            };
            
            /**
             * @currentFile
             */
            this.getCurrentOwner         = function(currentFile) {
                var ret,
                    current     = currentFile || this.getCurrentFile(),
                    owner       = this.getByClass('owner', current);
                
                ret             = owner.textContent;
                
                return ret;
            };
            
             /**
             * unified way to get current file content
             *
             * @callback - callback function or data struct {sucess, error}
             * @currentFile
             */
            this.getCurrentFileContent       = function(pParams, currentFile) {
                var ret,
                    lCurrentFile    = currentFile ? currentFile : this.getCurrentFile(),
                    lParams         = pParams ? pParams : {},
                    lPath           = this.getCurrentPath(lCurrentFile),
                    lErrorWas       = pParams.error,
                    lError          = function(jqXHR) {
                        Util.exec(lErrorWas);
                        Images.showError(jqXHR);
                    };
                
                if (Util.isFunction(lParams))
                    lParams.success = Util.retExec(pParams);
                
                lParams.error = lError;
                
                
                if (this.isCurrentIsDir(lCurrentFile))
                    lPath           += '?json';
                else if (!lParams.dataType)
                    lParams.dataType = 'text';
                
                if (!lParams.url)
                    lParams.url = CloudFunc.FS + lPath;
                
                ret    = this.ajax(lParams);
                
                return ret;
            };
             
            /**
             * unified way to get current file content
             *
             * @callback - function({data, name}) {}
             * @currentFile
             */
             this.getCurrentData             = function(callback, currentFile) {
                var hash,
                    lCurrentFile    = currentFile ? currentFile : Cmd.getCurrentFile(),
                    path            = DOM.getCurrentPath(lCurrentFile),
                    isDir           = DOM.isCurrentIsDir(lCurrentFile),
                    
                    func            = function(data) {
                        var length,
                           ONE_MEGABYTE    = 1024 * 1024 * 1024;
                        
                        if (Util.isObject(data))
                            data = Util.stringifyJSON(data);
                        
                        length  = data.length;
                        if (hash && length < ONE_MEGABYTE)
                            DOM.saveDataToStorage(path, data, hash);
                        
                        Util.exec(callback, data);
                    };
                
                if (isDir)
                    DOM.getCurrentFileContent(func, lCurrentFile);
                else
                    DOM.checkStorageHash(path, function(error, equal, hashNew) {
                        Util.ifExec(!error && equal, function() {
                                DOM.getDataFromStorage(path, callback);
                            }, function() {
                                hash = hashNew;
                                DOM.getCurrentFileContent(func, lCurrentFile);
                            });
                        });
            };
            
            
            /**
             * unified way to save current file content
             *
             * @callback - function({data, name}) {}
             * @currentFile
             */
            this.saveCurrentData             = function(url, data, callback, query) {
                if (!query)
                    query = '';
                
                DOM.RESTful.write(url + query, data, function() {
                    DOM.saveDataToStorage(url, data);
                });
            };
            
            /**
             * unified way to get RefreshButton
             */
            this.getRefreshButton        = function() {
                if (!CloudFunc)
                    console.trace();
                
                var lPanel      = this.getPanel(),
                    lRefresh    = this.getByClass(CloudFunc.REFRESHICON, lPanel),
                    ret        = lRefresh;
                
                return ret;
            };
            
            
            /**
             * unified way to set current file
             */
            this.setCurrentFile          = function(currentFile) {
                var ret,
                    CENTER          = true,
                    currentFileWas  = this.getCurrentFile();
                
                if (currentFile) {
                    if (currentFileWas)
                        unsetCurrentFile(currentFileWas);
                    
                    this.addClass(currentFile, CURRENT_FILE);
                    
                    /* scrolling to current file */
                    this.scrollIntoViewIfNeeded(currentFile, CENTER);
                    
                    ret = true;
                    
                    Cmd.updateCurrentInfo();
                }
                
                return  this;
            };
            
             /*
              * set current file by position
              *
              * @param layer    - element
              * @param          - position {x, y}
              */
            this.getCurrentByPosition               = function(position) {
                var element, tag, isChild,
                    x   = position.x,
                    y   = position.y;
                
                element = document.elementFromPoint(x, y),
                tag     = element.tagName;
                
                isChild = Util.strCmp(tag, ['A', 'SPAN', 'LI']);
                
                if (!isChild) {
                    element = null;
                } else {
                    switch (tag) {
                    case 'A':
                        element = element.parentElement.parentElement;
                        break;
                    
                    case 'SPAN':
                        element = element.parentElement;
                        break;
                    }
                }
                
                return element;
            };
            
            /**
             * select current file
             * @param currentFile
             */
            this.toggleSelectedFile              = function(currentFile) {
                var current     = currentFile || this.getCurrentFile(),
                    ret        = this.toggleClass(current, SELECTED_FILE);
                
                return ret;
            };
            
            this.toggleAllSelectedFiles         = function() {
                var i, n,
                    panel       = DOM.getPanel(),
                    files       = DOM.getFiles(panel),
                    name        = DOM.getCurrentName(files[0]);
                
                if (name === '..')
                    i = 1;
                else
                    i = 0;
                
                n = files.length;
                for (;i < n; i++)
                    DOM.toggleSelectedFile(files[i]);
                
                return Cmd;
            };
            
            function selectByPattern(msg, files) {
                var n,
                    allMsg      = 'Specify file type for ' + msg + ' selection',
                    i           = 0,
                    type,
                    matches     = 0,
                    name,
                    shouldSel   = msg === 'expand',
                    isSelected, isMatch,
                    current;
                
                type            = Dialog.prompt(allMsg, SelectType);
                
                if (type !== null) {
                    SelectType  = type;
                    
                    /* if type empty - select all files */
                    if (type === '')
                        type = '*';
                    
                    type        = '^' + type; /* search from start of line */
                    type        = Util.replaceStr(type, '.', '\\.');
                    type        = Util.replaceStr(type, '*', '.*');
                    type        = Util.replaceStr(type, '?', '.?\\');
                    type        += '$'; /* search to end of line */
                    
                    n           = files && files.length;
                    for (i = 0; i < n; i++) {
                        current = files[i];
                        name    = DOM.getCurrentName(current);
                            
                        if (name !== '..') {
                            isMatch     = name.match(new RegExp(type));
                            
                            if (isMatch) {
                                ++matches;
                                
                                isSelected  = DOM.isSelected(current);
                                
                                if (shouldSel)
                                    isSelected = !isSelected;
                                
                                if (isSelected)
                                    DOM.toggleSelectedFile(current);
                            } else if (!shouldSel)
                                ++i;
                        }
                    }
                    
                    if (!matches)
                        Dialog.alert('No matches found!');
                }
            }
            
            /* 
             * open dialog with expand selection
             */
            this.expandSelection                = function() {
                var msg     = 'expand',
                    files   = CurrentInfo.files;
                
                selectByPattern(msg, files);
            };
            
            /* 
             * open dialog with shrink selection
             */
            this.shrinkSelection                = function() {
                var msg     = 'shrink',
                    files   = DOM.getSelectedFiles();
               
               selectByPattern(msg, files);
            };
            
            /**
             * setting history wrapper
             */
            this.setHistory              = function(data, pTitle, url) {
                var ret = window.history;
                
                if (ret)
                    history.pushState(data, pTitle, url);
                
                return ret;
            };
            
            /**
             * set title with pName
             * create title element 
             * if it  absent
             * @param pName
             */    
            
            this.setTitle                = function(pName) {
                if (!Title)
                    Title =     DOMTree.getByTag('title')[0] ||
                                DOM.anyload({
                                    name:'title',
                                    parentElement: document.head,
                                    innerHTML: pName
                                });
                if (Title)
                    Title.textContent = pName;
                
                return Title;
            };
            
            /**
             * current file check
             * 
             * @param currentFile
             */
            this.isCurrentFile           = function(currentFile) {
                var ret;
                
                if (currentFile )
                    ret = this.isContainClass(currentFile, CURRENT_FILE);
                
                return ret;
            };
            
            /**
             * selected file check
             * 
             * @param currentFile
             */
            this.isSelected              = function(pSelected) {
                var ret;
                
                if (pSelected )
                    ret = this.isContainClass(pSelected, SELECTED_FILE);
                
                return ret;
            };
            
            /**
             * check is current file is a directory
             * 
             * @param currentFile
             */
            this.isCurrentIsDir            = function(currentFile) {
                var lCurrent    = currentFile || this.getCurrentFile(),
                    lFileType   = this.getByClass('mini-icon', lCurrent),
                    ret        = this.isContainClass(lFileType, 'directory');
                
                return ret;
            };
            
            
           /**
             * get link from current (or param) file
             * 
             * @param currentFile - current file by default
             */
            this.getCurrentLink          = function(currentFile) {
                var lLink = this.getByTag( 'a', currentFile || this.getCurrentFile()),
                    
                    ret = lLink.length > 0 ? lLink[0] : -1;
                
                return ret;
            };
            
            /**
             * get link from current (or param) file
             * 
             * @param currentFile - current file by default
             */
            this.getCurrentPath          = function(currentFile) {
                var lCurrent    = currentFile || this.getCurrentFile(),
                    lPath       = this.getCurrentLink( lCurrent ).href;
                
                lPath           = decodeURI(lPath);
                /* убираем адрес хоста*/
                lPath = Util.removeStrOneTime( lPath, [CloudCmd.HOST, CloudFunc.FS] );
                
                return lPath;
            };
            
            /**
             * get name from current (or param) file
             * 
             * @param currentFile
             */
            this.getCurrentName          = function(currentFile) {
                var lCurrent = currentFile || this.getCurrentFile(),
                    lLink    = this.getCurrentLink( lCurrent );
                    
                if (Util.isObject(lLink))
                   lLink = lLink.title || lLink.textContent;
                
                return lLink;
            };
            
            this.getSelectedNames        = function(selected) {
                var current, first, name, i, n, isSelected,
                    ret = [];
                
                if (!selected)
                    selected = this.getSelectedFiles() || [];
                
                first           = selected[0];
                
                if (first) {
                    name        = this.getCurrentName(first);
                } else {
                    first       = this.getCurrentFile();
                    name        = this.getCurrentName(first);
                }
                
                isSelected  = this.isSelected(first);
                
                if (name === '..' && isSelected) {
                    selected.shift();
                    this.toggleSelectedFile(first);
                }
                
                n = selected.length;
                for (i = 0; i < n;i++) {
                    current = selected[i];
                    ret[i]  = this.getCurrentName(current);
                }
                
                return ret;
            };
            
            /**
             * set name from current (or param) file
             * 
             * @param name
             * @param current
             */
            this.setCurrentName          = function(name, current) {
                var link    = this.getCurrentLink(current),
                    dir     = this.getCurrentDirName() + '/',
                    panel   = DOM.getPanel();
                
                link.title  = link.textContent = name;
                link.href   = dir + name;
                current.id  = name + '(' + panel.id + ')';
                
                return link;
            };
            
            /**
             * check storage hash 
             */
            this.checkStorageHash       = function(name, callback) {
                DOM.loadCurrentHash(function(loadHash) {
                    var Storage     = DOM.Storage,
                        nameHash    = name + '-hash';
                    
                    Storage.get(nameHash, function(storeHash) {
                        var equal, error,
                            isContain   = Util.isContainStr(loadHash, 'error');
                        
                        if (isContain)
                            error = loadHash;
                        else if (loadHash === storeHash)
                            equal = true;
                        
                        Util.exec(callback, error, equal, loadHash);
                    });
                });
            };
            
            /**
             * save data to storage
             * 
             * @param name
             * @param data
             * @param callback 
             */
            this.saveDataToStorage = function(name, data, hash, callback) {
                CloudCmd.getConfig(function(config) {
                    var allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir(),
                        nameHash    = name + '-hash',
                        nameData    = name + '-data';
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else
                        Util.ifExec(hash, function() {
                            var Storage = DOM.Storage;
                            
                            Storage.set(nameHash, hash);
                            Storage.set(nameData, data);
                            
                            Util.exec(callback, hash);
                        }, function(callback) {
                            DOM.loadCurrentHash(function(loadHash) {
                                hash = loadHash;
                                callback();
                            });
                        });
                });
            };
            
            /**
             * save data to storage
             * 
             * @param name
             * @param data
             * @param callback 
             */
            this.getDataFromStorage = function(name, callback) {
                CloudCmd.getConfig(function(config) {
                    var Storage     = DOM.Storage,
                        nameHash    = name + '-hash',
                        nameData    = name + '-data',
                        allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir();
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else {
                        Util.asyncCall([
                            function(callback) {
                                Storage.get(nameData, function(data) {
                                    Util.exec(callback, data);
                                });
                            },
                            function(callback) {
                                Storage.get(nameHash, function(hash) {
                                    Util.exec(callback, hash);
                                });
                            }
                        ], callback);
                        
                        
                    }
                });
            };
            
            /** function getting FM
             * @param pPanel_o = {active: true}
             */
            this.getFM                   = function() {
                return this.getPanel().parentElement;
            };
            
            /** function getting panel active, or passive
             * @param pPanel_o = {active: true}
             */
            this.getPanel                = function(pActive) {
                var id          = 'js-',
                    current     = this.getCurrentFile(),
                    files       = current.parentElement,
                    panel       = files.parentElement,
                    isLeft      = panel.id === 'js-left';
                    
                /* if {active : false} getting passive panel */
                if (pActive && !pActive.active) {
                    id          += isLeft ? 'right' : 'left';
                    panel       = this.getById(id);
                }
                
                /* if two panels showed
                 * then always work with passive
                 * panel
                 */
                if (window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH)
                    panel = this.getById('js-left');
                    
                
                if (!panel)
                    Util.log('Error can not find Active Panel');
                    
                return panel;
            };
            
            this.getFiles               = function(element) {
                var files = DOM.getByClass('files', element),
                    ret     = files.children || [];
                
                return ret;
            };
            
            /** prevent default event */
            this.preventDefault          = function(pEvent) {
                var prevent = pEvent && pEvent.preventDefault,
                    func    = prevent && prevent.bind(pEvent);
                
                Util.exec(func);
            };
            
            /**
             * shows panel right or left (or active)
             */
            this.showPanel               = function(pActive) {
                var ret = true,
                    lPanel = this.getPanel(pActive);
                                
                if (lPanel)
                    this.show(lPanel);
                else
                    ret = false;
                
                return ret;
            };
            
            /**
             * hides panel right or left (or active)
             */
            this.hidePanel               = function(pActive) {
                var ret = false,
                    lPanel = this.getPanel(pActive);
                
                if (lPanel)
                    ret = this.hide(lPanel);
                
                return ret;
            };
                
            /**
             * open window with URL
             * @param url
             */
            this.openWindow              = function(url) {
                var left        = 140,
                    top         = 187,
                    width       = 1000,
                    height      = 650,
                    
                    options     = 'left='   + left          +
                        ',top='             + top           +
                        ',width='           + width         +
                        ',height='          + height        +
                        ',personalbar=0,toolbar=0'          +
                        ',scrollbars=1,resizable=1',
                    
                    wnd         = window.open(url, 'Cloud Commander Auth', options);
                
                if (!wnd)
                    Dialog.alert('Please disable your popup blocker and try again.');
            };
            
            /**
             * remove child of element
             * @param pChild
             * @param element
             */
            this.remove                  = function(pChild, element) {
                return (element || document.body).removeChild(pChild);
            };
            
            /**
             * remove current file from file table
             * @param current
             * 
             */
            this.deleteCurrent           = function(current) {
                var name, next, prev, parent, currentNew;
                
                if (!current)
                    Cmd.getCurrentFile();
                
                parent      = current && current.parentElement;
                name        = Cmd.getCurrentName(current);
                
                if (current && name !== '..') {
                    next    = current.nextSibling,
                    prev    = current.previousSibling;
                        
                    if (next)
                        currentNew = next;
                    else if (prev)
                        currentNew = prev;
                    
                    this.setCurrentFile(currentNew);
                    
                    parent.removeChild(current);
                }
                
                return currentNew;
            };
            
             /**
             * remove selected files from file table
             * @Selected
             */
            this.deleteSelected          = function(selected) {
                var i, n, current;
                
                if (!selected)
                    selected = this.getSelectedFiles();
                
                if (selected) {
                    n = selected.length;
                    
                    for (i = 0; i < n; i++) {
                        current = selected[i];
                        this.deleteCurrent(current);
                    }
                }
                
                return selected;
            };
            
            /**
             * rename current file
             * 
             * @currentFile
             */
            this.renameCurrent            = function(current) {
                var from, to, dirPath, cmp, files,
                    RESTful     = DOM.RESTful;
                
                if (!Cmd.isCurrentFile(current))
                    current = Cmd.getCurrentFile();
                
                from        = Cmd.getCurrentName(current),
                to          = Dialog.prompt('Rename', from) || from,
                dirPath     = Cmd.getCurrentDirPath();
                cmp         = Util.strCmp(from, to);
                
                if (!cmp) {
                    files      = {
                        from    : dirPath + from,
                        to      : dirPath + to
                    };
                    
                    RESTful.mv(files, function() {
                        var Storage = DOM.Storage,
                            path    = CloudFunc.rmLastSlash(dirPath);
                        
                        DOM.setCurrentName(to, current);
                        Cmd.updateCurrentInfo();
                        Storage.remove(path);
                    });
                }
            };
            
            /*
             * process files (copy or move)
             * @param operation
             */
            function processFiles(operation) {
                 var n, name, from, to, files, cmp, msg, opFunc,
                    path        = CurrentInfo.dirPath,
                    RESTful     = DOM.RESTful,
                    names       = Cmd.getSelectedNames(),
                    
                    length      = names && names.length;
                
                if (operation.copy) {
                    opFunc      = RESTful.cp;
                    msg         = 'Copy ';
                } else if (operation.move) {
                    opFunc      = RESTful.mv;
                    msg         = 'Rename/Move ';
                }
                
                
                if (!length) {
                    name        = DOM.getCurrentName();
                    names.push(name);
                } else if (length === 1) {
                    name    = names[0];
                }
                
                n           = names.length;
                
                if (n > 1)
                    msg     += n + ' file(s)';
                else
                    msg     += '"' + name + '"';
                
                msg         += ' to';
                
                from        = path;
                to          = DOM.getNotCurrentDirPath();
                
                if (name === '..') {
                    Dialog.alert('No files selected!');
                } else {
                    to          = Dialog.prompt(msg, to);
                    
                    cmp         = Util.strCmp(from, to);
                
                    if (!cmp) {
                        files   = {
                            from    : from,
                            names   : names,
                            to      : to
                        };
                        
                        opFunc(files, function() {
                            var panel           = DOM.getPanel(),
                                panelPassive    = DOM.getPanel(true),
                                id              = panelPassive.id,
                                dotDot          = DOM.getById( '..(' + id + ')');
                            
                            if (operation.move)
                                CloudCmd.refresh(dotDot, panel);
                            
                            DOM.setCurrentFile(dotDot);
                            CloudCmd.refresh(dotDot, panelPassive);
                            DOM.Storage.remove(path);
                        });
                    }
                }
            }
            
            this.copyFiles      = function() {
                processFiles({
                    copy: true
                });
            };
            
            this.moveFiles      = function() {
                processFiles({
                    move: true
                });
            };
            
            /**
             * unified way to scrollIntoViewIfNeeded
             * (native suporte by webkit only)
             * @param element
             * @param pCenter
             */
            this.scrollIntoViewIfNeeded  = function(element, pCenter) {
                var ret = element && element.scrollIntoViewIfNeeded;
                
                /* for scroll as small as possible
                 * param should be false
                 */
                if (arguments.length === 1)
                    pCenter = false;
                
                if (ret)
                    element.scrollIntoViewIfNeeded(pCenter);
                
                return ret;
            };
            
            /* scroll on one page*/
            this.scrollByPages           = function(element, pPages) {
               var ret = element && element.scrollByPages && pPages;
                
                if (ret)
                    element.scrollByPages(pPages);
                
                return ret;
            };
            
            this.getType                = function(name, callback) {
                CloudCmd.getExt(function(extensions) {
                    var index,
                        ext = Util.getExtension(name);
                    
                    ext     = extensions[ext];
                    
                    if (ext) {
                        index   = ext.indexOf('/') + 1;
                        ext     = ext.substr(index);
                    }
                    
                    Util.exec(callback, ext);
              });
            };
            
            this.changePanel            = function() {
                var id, files,
                    Info            = CurrentInfo,
                    current         = Info.element,
                    panel           = Info.panel,
                    filesPassive    = Info.filesPassive;
            
                id              = panel.id;
                TabPanel[id]    = current;
                
                panel           = Info.panelPassive;
                id              = panel.id;
                
                current         = TabPanel[id];
                
                if (current)
                    files       = current.parentElement;
                
                if (!files || !files.parentElement)
                    current     = filesPassive[0];
                
                DOM.setCurrentFile(current);
                
                return this;
            };
            
            this.CurrentInfo            = CurrentInfo,
            
            this.updateCurrentInfo      = function(currentFile) {
                var info            = Cmd.CurrentInfo,
                    current         = currentFile || Cmd.getCurrentFile(),
                    files           = current.parentElement,
                    panel           = files.parentElement,
                    
                    panelPassive    = Cmd.getPanel({active:false}),
                    filesPassive    = DOM.getFiles(panelPassive),
                    
                    name            = Cmd.getCurrentName(current);
                
                info.dir            = Cmd.getCurrentDirName();
                info.dirPath        = Cmd.getCurrentDirPath();
                info.parentDirPath  = Cmd.getParentDirPath();
                info.element        = current;
                info.ext            = Util.getExtension(name);
                info.files          = files.children,
                info.filesPassive   = filesPassive,
                info.first          = files.firstChild;
                info.getData        = Cmd.getCurrentData;
                info.last           = files.lastChild;
                info.link           = Cmd.getCurrentLink(current);
                info.mode           = Cmd.getCurrentMode(current);
                info.name           = name;
                info.path           = Cmd.getCurrentPath(current);
                info.panel          = panel;
                info.panelPassive   = panelPassive;
                info.size           = Cmd.getCurrentSize(current);
                info.isDir          = Cmd.isCurrentIsDir();
                info.isSelected     = Cmd.isSelected(current);
            };
        
        },
        
        DOMTree                     = Util.extendProto(DOMTreeProto),
        Events                      = Util.extendProto(EventsProto),
        Images                      = Util.extendProto(ImagesProto);
    
    DOMProto                        = DOMFunc.prototype = new CmdProto();
    
    Dialog                          = new DialogProto();
    
    Util.extend(DOMProto, [
        DOMTree, {
            Events  : Events,
            Images  : Images,
            Dialog  : Dialog
        }
    ]);
    
    DOM                             = new DOMFunc();
    
})(Util);
