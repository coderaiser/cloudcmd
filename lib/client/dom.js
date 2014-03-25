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
            var ImagesProto          = function() {
                var Images = {
                    'image-loading' : null,
                    'image-error'   : null
                };
                
                function getImage(name) {
                    var id      = 'js-image-' + name,
                        element = Images[id];
                    
                    if (!element)
                        element = Images[id] = DOM.anyload({
                            name        : 'span',
                            className   : 'icon ' + name,
                            id          : id,
                            not_append  : true
                        });
                    
                    return element;
                }
                    
                /* Функция создаёт картинку загрузки */
                this.loading = function() {
                    return getImage('loading');
                };
                
                /* Функция создаёт картинку ошибки загрузки */
                this.error = function() {
                    return getImage('error');
                };
            },
            Images = new ImagesProto();
            /** 
             * Function shows loading spinner
             * pPosition = {top: true};
             */   
            this.showLoad = function(position) {
                var top             = position && position.top,
                    current,
                    loadingImage    = Images.loading(),
                    errorImage      = Images.error(),
                    parent          = loadingImage.parentElement;
                
                DOM.hide(errorImage);
                
                if (top)
                    current         = DOM.getRefreshButton().parentElement;
                else {
                    current         = DOM.getCurrentFile();
                    current         = DOM.getByClass('name', current);
                }
                
                if (!parent || (parent && parent !== current))
                    current.appendChild(loadingImage);
                
                DOM.show(loadingImage);
                
                return loadingImage;
            };
            
            /**
             * hide load image
             */
            this.hideLoad = function() {
                DOM.hide(Images.loading());
            };
            
            /**
             * show error image (usualy after error on ajax request)
             */
            this.showError = function(jqXHR) {
                var func,
                    lLoadingImage   = Images.loading(),
                    lErrorImage     = Images.error(),
                    lResponse       = '',
                    lStatusText     = '',
                    lStatus         = 0,
                    lText           = '';
                            
                if (jqXHR) {
                    lResponse       = jqXHR.responseText;
                    lStatusText     = jqXHR.statusText;
                    lStatus         = jqXHR.status;
                    lText           = lStatus === 404 ? lResponse : lStatusText;
                    
                    if (!lText)
                        if (Util.isString(jqXHR))
                            lText = jqXHR;
                        else
                            lText = '';
                }
                
                /* если файла не существует*/
                if (Util.isContainStr(lText, 'Error: ENOENT, '))
                    lText = lText.replace('Error: ENOENT, n','N');
                
                /* если не хватает прав для чтения файла*/
                else if (Util.isContainStr(lText, 'Error: EACCES,'))
                    lText = lText.replace('Error: EACCES, p','P');
                
                DOM.show(lErrorImage);
                lErrorImage.title = lText;
                
                var lParent = lLoadingImage.parentElement;
                if (lParent)
                    lParent.appendChild(lErrorImage);
                
                DOM.hide(lLoadingImage);
                
                if (lText) {
                    Util.log(lText);
                    func = Dialog.alert.bind(null, lText);
                    setTimeout(func, 100);
                }
                
                return lErrorImage;
            };
        },
        
        DOMTreeProto                = function() {
            var DOM                     = this;
            /**
             * add class to element
             * 
             * @param pElement
             * @param pClass
             */
            this.addClass                = function(pElement, pClass) {
               var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.add(pClass);
                
                return this;
            };
            
            /**
             * remove class pClass from element pElement
             * @param pElement
             * @param pClass
             */
            this.removeClass             = function(pElement, pClass) {
                var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.remove(pClass);
                
                return this;
            };
            
            this.toggleClass             = function(pElement, pClass) {
                var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.toggle(pClass);
                
                return this;
            };
            
            /**
             * check class of element
             * 
             * @param pElement
             * @param pClass
             */
            this.isContainClass          = function(pElement, pClass) {
                var lRet,
                    lClassList = pElement && pElement.classList;
                    
                if (lClassList )
                    lRet = lClassList.contains(pClass);
                    
                return lRet;
            };
            
            /**
             * Function search element by tag
             * @param pTag - className
             * @param pElement - element
             */
            this.getByTag                = function(pTag, pElement) {
                return (pElement || document).getElementsByTagName(pTag);
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
             * @param pElement - element
             */
            this.getByClass             = function(pClass, pElement) {
                var element = pElement || document,
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
             * @param pElement - element
             */
            this.getByClassAll          = function(pClass, pElement) {
                return (pElement || document).getElementsByClassName(pClass);
            };
            
            /**
             * add class=hidden to element
             * 
             * @param pElement
             */
            this.hide                    = function(pElement) {
                return DOM.addClass(pElement, 'hidden');
            };
            
            this.show                    = function(pElement) {
                return DOM.removeClass(pElement, 'hidden');
            };
        },
        
        EventsProto                 = function() {
            var Events  = this,
                ADD     = true,
                REMOVE  = false;
                        
            /**
             * safe add event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.add                        = function(pType, pListener, pElement, pUseCapture) {
                return process(
                    ADD,
                    pType,
                    pListener,
                    pElement,
                    pUseCapture
                );
            };
            
            /**
             * safe add event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.addOnce                    = function(pType, pListener, pElement, pUseCapture) {
                var lRet        = this,
                    lOneTime    = function (pEvent) {
                        lRet.remove(pType, lOneTime, pElement, pUseCapture);
                        pListener(pEvent);
                    };
                
                this.add(pType, lOneTime, pElement, pUseCapture);
                
                return lRet;
            };
            
            /**
             * safe remove event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.remove                     = function(pType, pListener, pElement, pUseCapture) {
               return process(
                    REMOVE,
                    pType,
                    pListener,
                    pElement,
                    pUseCapture
                );
            };
            
            
            /**
             * safe add event keydown listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addKey                     = function(pListener, pElement, pUseCapture) {
                return this.add('keydown', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addClick                   = function(pListener, pElement, pUseCapture) {
                return this.add('click', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe remove event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.rmClick                   = function(pListener, pElement, pUseCapture) {
                return this.remove('click', pListener, pElement, pUseCapture);
            };
            
            this.addContextMenu             = function(pListener, pElement, pUseCapture) {
                return this.add('contextmenu', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addError                   = function(pListener, pElement, pUseCapture) {
                return this.add('error', pListener, pElement, pUseCapture);
            };
            
            /**
             * crossbrowser create event
             * 
             * @param pEventName
             * @param pKeyCode - not necessarily
             */
            this.create                     = function(pEventName, pKeyCode) {
                var lEvent = document.createEvent('Event');
                
                lEvent.initEvent(pEventName, true, true);
                
                if (pKeyCode)
                    lEvent.keyCode = pKeyCode;
                
                lEvent.isDefaultPrevented = function() {
                    return this.defaultPrevented;
                };
                
                return lEvent;
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
            this.dispatch                   = function(pEvent, pElement) {
                var lRet, lEvent;
                
                if (Util.isString(pEvent))
                    lEvent = Events.create(pEvent);
                else
                    lEvent = pEvent;
                
                return (pElement || window).dispatchEvent(lEvent);
            };
            
            /**
             * dispatch keydown event
             * 
             * @param pKeyCode
             * @param pElement
             */
            this.dispatchKey                = function(pKeyCode, pElement) {
                var lEvent  = this.createKey(pKeyCode),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch click event
             * 
             * @param pElement
             */
            this.dispatchClick              = function(pElement) {
                var lEvent  = this.createClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch dblclick event
             * 
             * @param pElement
             */
            this.dispatchDblClick           = function(pElement) {
                var lEvent  = this.createDblClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            function process(pAdd, pType, pListener, pElement, pUseCapture) {
                var i, n, 
                    lElement        = (pElement || window),
                    
                    lEventProcess   =  pAdd ?
                        lElement.addEventListener :
                        lElement.removeEventListener,
                    
                    lRet            = pType && lEventProcess,
                    lEvent          = '';
                
                lEventProcess       = lEventProcess.bind(lElement);
                
                if (lRet) {
                    if (Util.isString(pType))
                        lEventProcess(
                            pType,
                            pListener,
                            pUseCapture
                        );
                    else if (Util.isArray(pType))
                        for (i = 0, n = pType.length; i < n; i++)
                            process(
                                pAdd,
                                pType[i],
                                pListener,
                                pElement,
                                pUseCapture
                            );
                    else if (Util.isObject(pType)) {
                        if (pListener)
                            pElement = pListener;
                        
                        for(lEvent in pType)
                            process(
                                pAdd,
                                lEvent,
                                pType[lEvent],
                                pElement,
                                pUseCapture
                            );
                    }
                }
            }
        },
        
        CmdProto                    = function() {
            var Cmd                     = this,
                CurrentInfo             = {},
                CURRENT_FILE            = 'current-file',
                SELECTED_FILE           = 'selected-file',
                SelectType              = '*.*',
                Title;
            
            /**
             * private function thet unset currentfile
             * 
             * @currentFile
             */
            function unsetCurrentFile(currentFile) {
                var lRet = DOM.isCurrentFile(currentFile);
                
                if (lRet)
                    DOM.removeClass(currentFile, CURRENT_FILE);
                
                return lRet;
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
             * @pTypeName
             * @pType
             */
            this.promptNewFile       = function() {
                 promptNew('file');
            };
            
            function promptNew(pTypeName, pType) {
                var RESTful = DOM.RESTful,
                    lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lMsg    = 'New ' + pTypeName || 'File',
                    lType   = Util.isString(pType) ? pType : '';
                
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
                        type   ='directory';
                    else
                        type = 'file';
                     
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
                    
                    Storage.remove(dir);
                });
            };
            
            
            /**
             * get current direcotory name
             */
            this.getCurrentDirName           = function() {
                var lRet,
                    lSubstr,
                    /* получаем имя каталога в котором находимся */
                    lHref   = this.getCurrentDirPath();
                
                lHref       = CloudFunc.rmLastSlash(lHref);
                lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
                lRet        = Util.removeStrOneTime(lHref, lSubstr + '/') || '/';
                
                return lRet;
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
                var selected    = this.getByClassAll(SELECTED_FILE),
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
                var lRet,
                    lCurrent    = currentFile || this.getCurrentFile(),
                    lMode       = this.getByClass('mode', lCurrent);
                    lRet        = lMode.textContent;
                
                return lRet;
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
                var lRet,
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
                
                lRet    = this.ajax(lParams);
                
                return lRet;
            };
             
            /**
             * unified way to get current file content
             *
             * @callback - function({data, name}) {}
             * @currentFile
             */
             this.getCurrentData             = function(callback, currentFile) {
                var lHash,
                    lCurrentFile    = currentFile ? currentFile : Cmd.getCurrentFile(),
                    path            = DOM.getCurrentPath(lCurrentFile),
                    isDir           = DOM.isCurrentIsDir(lCurrentFile),
                    
                    func            = function(data, hash) {
                        var length,
                           ONE_MEGABYTE    = 1024 * 1024 * 1024;
                        
                        if (Util.isObject(data))
                            data = Util.stringifyJSON(data);
                        
                        length  = data.length;
                        if (lHash && length < ONE_MEGABYTE)
                            DOM.saveDataToStorage(path, data, lHash);
                        
                        Util.exec(callback, data);
                    };
                
                if (isDir)
                    DOM.getCurrentFileContent(func, lCurrentFile);
                else
                    DOM.checkStorageHash(path, function(error, equal, hash) {
                        Util.ifExec(!error && equal, function() {
                                DOM.getDataFromStorage(path, callback);
                            }, function() {
                                lHash = hash;
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
                    lRet        = lRefresh;
                
                return lRet;
            };
            
            
            /**
             * unified way to set current file
             */
            this.setCurrentFile          = function(currentFile) {
                var lRet,
                    lCurrentFileWas = this.getCurrentFile();
                
                if (currentFile) {
                    if (lCurrentFileWas)
                        unsetCurrentFile(lCurrentFileWas);
                    
                    this.addClass(currentFile, CURRENT_FILE);
                    
                    /* scrolling to current file */
                    this.scrollIntoViewIfNeeded(currentFile);
                    
                    lRet = true;
                    
                    Cmd.updateCurrentInfo();
                }
                
                return  lRet;
            };
            
            /**
             * select current file
             * @param currentFile
             */
            this.toggleSelectedFile              = function(currentFile) {
                var lCurrent    = currentFile || this.getCurrentFile(),
                    lRet        = this.toggleClass(currentFile, SELECTED_FILE);
                
                return this;
            };
            
            this.toggleAllSelectedFiles         = function(currentFile) {
                var i, n,
                    isStr       = Util.isString(currentFile),
                    lCurrent    = !isStr && currentFile || Cmd.getCurrentFile(),
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
                    arr         = [],
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
                var lRet = window.history;
                
                if (lRet)
                    history.pushState(data, pTitle, url);
                
                return lRet;
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
                var lRet;
                
                if (currentFile )
                    lRet = this.isContainClass(currentFile, CURRENT_FILE);
                
                return lRet;
            };
            
            /**
             * selected file check
             * 
             * @param currentFile
             */
            this.isSelected              = function(pSelected) {
                var lRet;
                
                if (pSelected )
                    lRet = this.isContainClass(pSelected, SELECTED_FILE);
                
                return lRet;
            };
            
            /**
             * check is current file is a directory
             * 
             * @param currentFile
             */
            this.isCurrentIsDir            = function(currentFile) {
                var lCurrent    = currentFile || this.getCurrentFile(),
                    lFileType   = this.getByClass('mini-icon', lCurrent),
                    lRet        = this.isContainClass(lFileType, 'directory');
                
                return lRet;
            };
            
            
           /**
             * get link from current (or param) file
             * 
             * @param currentFile - current file by default
             */
            this.getCurrentLink          = function(currentFile) {
                var lLink = this.getByTag( 'a', currentFile || this.getCurrentFile()),
                    
                    lRet = lLink.length > 0 ? lLink[0] : -1;
                
                return lRet;
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
                var current, first, name, i, n,
                    ret = [];
                
                if (!selected)
                    selected = this.getSelectedFiles() || [];
                
                first  = selected[0];
                name   = this.getCurrentName(first);
                    
                if (name === '..')
                    this.toggleSelectedFile(first);
                
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
                    var Storage     = DOM.Storage;
                    
                    Storage.get(name + '-hash', function(storeHash) {
                        var equal, error,
                            nameHash    = name + '-hash',
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
                    var data, hash,
                        Storage     = DOM.Storage,
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
                var lRet = true,
                    lPanel = this.getPanel(pActive);
                                
                if (lPanel)
                    this.show(lPanel);
                else
                    lRet = false;
                
                return lRet;
            };
            
            /**
             * hides panel right or left (or active)
             */
            this.hidePanel               = function(pActive) {
                var lRet = false,
                    lPanel = this.getPanel(pActive);
                
                if (lPanel)
                    lRet = this.hide(lPanel);
                
                return lRet;
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
                    
                    lOptions    = 'left='   + left          +
                        ',top='             + top           +
                        ',width='           + width         +
                        ',height='          + height        +
                        ',personalbar=0,toolbar=0'          +
                        ',scrollbars=1,resizable=1';
                    
                var lWind       = window.open(url, 'Cloud Commander Auth', lOptions);
                if (!lWind)
                    Dialog.alert("Please disable your popup blocker and try again.");
            };
            
            /**
             * remove child of element
             * @param pChild
             * @param pElement
             */
            this.remove                  = function(pChild, pElement) {
                return (pElement || document.body).removeChild(pChild);
            };
            
            /**
             * remove current file from file table
             * @param current
             * 
             */
            this.deleteCurrent           = function(current) {
                var name, next, prev, parent;
                
                if (!current)
                    Cmd.getCurrentFile();
                
                parent      = current && current.parentElement;
                name        = Cmd.getCurrentName(current);
                
                if (current && name !== '..') {
                    next    = current.nextSibling,
                    prev    = current.previousSibling;
                        
                    if (next)
                        this.setCurrentFile(next);
                    else if (prev)
                        this.setCurrentFile(prev);
                    
                    parent.removeChild(current);
                }
                
                return current;
            };
            
             /**
             * remove selected files from file table
             * @Selected
             */
            this.deleteSelected          = function(selected) {
                var i, n, last, current;
                
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
            
            /**
             * move current file
             * 
             * @currentFile
             */
            this.moveCurrent     = function(current) {
                var name, from, to, cmp, files,
                    RESTful     = DOM.RESTful;
                
                if (!Cmd.isCurrentFile(current))
                    current = Cmd.getCurrentFile();
                
                name        = Cmd.getCurrentName(current),
                from        = Cmd.getCurrentPath(),
                to          = Cmd.getNotCurrentDirPath() + name;
                
                to          = Dialog.prompt('Rename/Move file "' + name + '"', to);
                cmp         = !Util.strCmp(from, to);
                
                if (to && cmp) {
                    files      = {
                        from    : from,
                        to      : to
                    };
                    
                    RESTful.mv(files, function() {
                        var dotDot,
                            panel   = DOM.getPanel(true),
                            id      = panel.id,
                            name    = '..(' + id + ')';
                        
                        dotDot      = DOM.getById(name);
                        
                        DOM.deleteCurrent(current);
                        DOM.setCurrentFile (dotDot);
                        CloudCmd.refresh();
                    });
                }
            };
            
            /**
             * copy current file
             * 
             * @param current
             */
            this.copyCurrent     = function(current) {
                var name, from, to, files, cmp,
                    RESTful     = DOM.RESTful;
                
                if (!Cmd.isCurrentFile(current))
                    current = Cmd.getCurrentFile();
                
                name    = Cmd.getCurrentName(current),
                from    = Cmd.getCurrentPath(),
                to      = Cmd.getNotCurrentDirPath() + name;
                to      = Dialog.prompt('Copy file "' + name + '" to', to);
                cmp     = Util.strCmp(from, to);
                
                if (!cmp) {
                    files   = {
                        from    : from,
                        to      : to
                    };
                    
                    RESTful.cp(files, function() {
                        var panel   = DOM.getPanel(true),
                            id      = panel.id,
                            dotDot  = DOM.getById( '..(' + id + ')');
                        
                        DOM.setCurrentFile(dotDot);
                        CloudCmd.refresh();
                    });
                }
            };
            
            /**
             * unified way to scrollIntoViewIfNeeded
             * (native suporte by webkit only)
             * @param pElement
             * @param pCenter
             */
            this.scrollIntoViewIfNeeded  = function(pElement, pCenter) {
                var lRet = pElement && pElement.scrollIntoViewIfNeeded;
                
                /* for scroll as small as possible
                 * param should be false
                 */
                if (arguments.length === 1)
                    pCenter = false;
                
                if (lRet)
                    pElement.scrollIntoViewIfNeeded(pCenter);
                
                return lRet;
            };
            
            /* scroll on one page*/
            this.scrollByPages           = function(pElement, pPages) {
               var lRet = pElement && pElement.scrollByPages && pPages;
                
                if (lRet)
                    pElement.scrollByPages(pPages);
                
                return lRet;
            };
            
            this.getType                = function(name, callback) {
                CloudCmd.getExt(function(extensions) {
                    var str, index,
                        ext = Util.getExtension(name);
                    ext     = extensions[ext];
                    
                    if (ext) {
                        index   = ext.indexOf('/') + 1;
                        ext     = ext.substr(index);
                    }
                    
                    Util.exec(callback, ext);
              });
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
