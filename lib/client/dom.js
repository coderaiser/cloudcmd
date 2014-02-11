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
                    var id      = 'image-' + name,
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
        
        RESTfulProto                = function() {
            this.delete = function(pUrl, pData, pCallBack, pQuery) {
                sendRequest({
                    method      : 'DELETE',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: !!pData }
                });
            };
            
            this.save   = function(pUrl, pData, pCallBack, pQuery) {
                sendRequest({
                    method      : 'PUT',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: true }
                });
            };
            
            this.read   = function(pUrl, pCallBack, pQuery) {
                sendRequest({
                    method      : 'GET',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    callback    : pCallBack
                });
            };
            
             this.cp     = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/cp',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.zip    = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/zip',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.mv     = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/mv',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.config    = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/config',
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: true }
                });
            };
           
           function sendRequest(pParams) {
                var lRet = Util.checkObjTrue(pParams, ['method']);
                if (lRet) {
                    var p               = pParams;
                        
                    Images.showLoad( p.imgPosition );
                    CloudCmd.getConfig(function(pConfig) {
                        var lData;
                        
                        if (Util.isString(p.url))
                            p.url = decodeURI(p.url);
                        
                        if (p.data                 &&
                            !Util.isString(p.data)  &&
                                !Util.isArrayBuffer(p.data))
                                    lData = Util.stringifyJSON(p.data);
                        else
                            lData = p.data;
                        
                        p.url        = pConfig && pConfig.apiURL + p.url,
                        DOM.ajax({
                            method  : p.method,
                            url     : p.url,
                            data    : lData,
                            error   : Images.showError,
                            success : function(pData) {
                                Images.hideLoad();
                                Util.log(pData);
                                Util.exec(p.callback, pData);
                            }
                        });
                    });
                }
                
                return lRet;
            }
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
            this.getByClass              = function(pClass, pElement) {
                var element = pElement || document,
                    ret     = this.getByClassAll(pClass, element)[0];
                
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
        StorageProto                = function() {
            /* приватный переключатель возможности работы с кэшем */
            var StorageAllowed;
            
            /* функция проверяет возможно ли работать с кэшем каким-либо образом */
            this.isAllowed   = function() {
                var lRet = StorageAllowed && !!window.localStorage;
                return lRet;
            };
            
            /**
             * allow Storage usage
             */
            this.setAllowed = function(pAllowd) {
                StorageAllowed = pAllowd;
                
                return pAllowd;
            };
            
            /** remove element */
            this.remove      = function(pItem) {
                var lRet = this;
                
                if (StorageAllowed)
                    localStorage.removeItem(pItem);
                    
                return lRet;
            };
            
            /** если доступен localStorage и
             * в нём есть нужная нам директория -
             * записываем данные в него
             */
            this.set         = function(pName, pData) {
                var lRet = this;
                
                if (StorageAllowed && pName)
                    localStorage.setItem(pName, pData);
                
                return lRet;
            },
            
            /** Если доступен Storage принимаем из него данные*/
            this.get        = function(pName) {
                var lRet;
                
                if (StorageAllowed)
                    lRet = localStorage.getItem(pName);
                    
                return lRet;
            },
            
            /* get all Storage from local storage */
            this.getAll     = function() {
                var lRet = null;
                
                if (StorageAllowed)
                    lRet = localStorage;
                
                return lRet;
            };
            
            /** функция чистит весь кэш для всех каталогов*/
            this.clear       = function() {
                var lRet = this;
                
                if (StorageAllowed)
                    localStorage.clear();
                
                return lRet;
            };
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
             * @pCurrentFile
             */
            function unsetCurrentFile(pCurrentFile) {
                var lRet = DOM.isCurrentFile(pCurrentFile);
                
                if (lRet)
                    DOM.removeClass(pCurrentFile, CURRENT_FILE);
                
                return lRet;
            }
            
              /**
             * load jquery from google cdn or local copy
             * @param pCallBack
             */
            this.jqueryLoad              = function(pCallBack) {
                CloudCmd.getConfig(function(config) {
                    var online = config.online && navigator.onLine;
                    
                    Util.ifExec(!online,
                        function() {
                            DOM.jsload('/lib/client/jquery.js', {
                                onload: pCallBack
                            });
                        },
                        function(callback) {
                            DOM.jquery({
                                onload: pCallBack,
                                onerror: callback
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
                var lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lMsg    = 'New ' + pTypeName || 'File',
                    lType   = Util.isString(pType) ? pType : '';
                
                if (lName === '..')
                    lName = '';
                
                lName       = Dialog.prompt(lMsg, lName);
                
                if (lName)
                    RESTful.save(lDir + lName + lType, null, CloudCmd.refresh);
            }
            
            /**
             * zip file
             *
             */
            this.zipFile      = function() {
                var lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lPath   = lDir + lName,
                    lFiles  = {
                        from    : lPath
                    };
                
                if (lName && lName !== '..')
                    RESTful.zip(lFiles, CloudCmd.refresh);
            };
            
            
            /**
             * delete currentfile, prompt before it
             *
             * @pCurrentFile
             */
            this.promptDeleteSelected = function(pCurrentFile) {
                var ret, type, isDir, path,
                    current, query, msg,
                    name        = '',
                    msgAsk      = 'Do you really want to delete the ',
                    msgSel      = 'selected ',
                    files       = Cmd.getSelectedFiles(),
                    names       = Cmd.getSelectedNames(files),
                    i, n        = names && names.length;
                
                if (!Cmd.isCurrentFile(pCurrentFile))
                    current    = DOM.getCurrentFile();
                
                if (n > 1) {
                    path    = Cmd.getCurrentDirPath();
                    
                    for (i = 0; i < 5 && i < n; i++)
                        name += '\n' + names[i];
                    
                    if (n >= 5)
                        name   += '\n...';
                    
                    msg    = msgAsk + msgSel + n + ' files/directoris?\n' + name ;
                    query  = '?files';
                } else {
                    path        = Cmd.getCurrentPath(current);
                    isDir       = Cmd.isCurrentIsDir(current);
                    
                    if (isDir) {
                        query  = '?dir';
                        type   ='directory';
                    } else
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
                    RESTful.delete(path, names, function() {
                        var dirPath = CurrentInfo.dirPath,
                            dir     = CloudFunc.rmLastSlash(dirPath);
                        
                        if (n > 1)
                            DOM.deleteSelected(files);
                        else
                            DOM.deleteCurrent(current);
                        
                        Storage.remove(dir);
                    }, query);
                
                return ret;
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
            this.getCurrentDirPath       = function(pPanel) {
                var lPanel  =  pPanel || this.getPanel(),
                    lPath   = this.getByClass('js-path', lPanel),
                    lRet;
                
                if (lPath)
                    lRet = lPath.textContent;
                
                return lRet;
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
             * @pCurrentFile
             */
            this.getCurrentFile          = function() {
                var lRet = this.getByClass(CURRENT_FILE);
                
                return lRet;
            };
            
            /**
             * get current file by name
             */
            this.getCurrentFileByName       = function(pName) {
                var lRet, lPanel, lName;
                
                lPanel  = DOM.getPanel();
                lName   = pName + '(' +  lPanel.id + ')';
                lRet    = DOM.getById(lName);
                
                return lRet;
            };
            
            /**
             * unified way to get current file
             *
             * @pCurrentFile
             */
            this.getSelectedFiles         = function() {
                var selected    = this.getByClassAll(SELECTED_FILE),
                    ret         = Util.slice(selected);
                
                return ret;
            };
            
            /**
             * get size
             * @pCurrentFile
             */
            this.getCurrentSize          = function(pCurrentFile) {
                var lRet,
                    lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lSize       = this.getByClass('size', lCurrent);
                    lSize       = lSize.textContent;
                    /* если это папка - возвращаем слово dir вместо размера*/
                    lRet        = Util.removeStrOneTime(lSize, ['<', '>']);
                
                return lRet;
            };
            
            /**
             * get size
             * @pCurrentFile
             */
            this.loadCurrentSize          = function(pCallBack, pCurrent) {
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                
                if (lName !== '..')
                    RESTful.read(lLink, function(pSize) {
                        DOM.setCurrentSize(pSize, lCurrent);
                        Util.exec(pCallBack, lCurrent);
                    }, '?size');
                
                return lRet;
            };
            
            /**
             * load hash
             * @pCallBack
             * @pCurrentFile
             */
            this.loadCurrentHash          = function(pCallBack, pCurrent) {
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                
                RESTful.read(lLink, pCallBack, '?hash');
                
                return lRet;
            };
            
            /**
             * load current modification time of file
             * @pCallBack
             * @pCurrentFile
             */
            this.loadCurrentTime          = function(pCallBack, pCurrent) {
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                
                RESTful.read(lLink, pCallBack, '?time');
                
                return lRet;
            };
            
            /**
             * set size
             * @pCurrentFile
             */
            this.setCurrentSize          = function(pSize, pCurrentFile) {
                var lCurrent        = pCurrentFile || this.getCurrentFile(),
                    lSizeElement    = this.getByClass('size', lCurrent),
                    lSize           = CloudFunc.getShortSize(pSize);
                
                lSizeElement.textContent = lSize;
            
            };
            
            /**
             * @pCurrentFile
             */
            this.getCurrentMode          = function(pCurrentFile) {
                var lRet,
                    lCurrent    = pCurrentFile || this.getCurrentFile(),
                    lMode       = this.getByClass('mode', lCurrent);
                    lRet        = lMode.textContent;
                
                return lRet;
            };
            
            /**
             * @pCurrentFile
             */
            this.getCurrentOwner         = function(pCurrentFile) {
                var ret,
                    current     = pCurrentFile || this.getCurrentFile(),
                    owner       = this.getByClass('owner', current);
                
                ret             = owner.textContent;
                
                return ret;
            };
            
             /**
             * unified way to get current file content
             *
             * @pCallBack - callback function or data struct {sucess, error}
             * @pCurrentFile
             */
            this.getCurrentFileContent       = function(pParams, pCurrentFile) {
                var lRet,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : this.getCurrentFile(),
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
             * @pCallBack - function({data, name}) {}
             * @pCurrentFile
             */
             this.getCurrentData             = function(pCallBack, pCurrentFile) {
                var lParams,
                    lHash,
                    ONE_MEGABYTE    = 1024 * 1024 * 1024,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : Cmd.getCurrentFile(),
                    lPath           = DOM.getCurrentPath(lCurrentFile),
                    isDir           = DOM.isCurrentIsDir(lCurrentFile),
                    
                    lFunc           = function(pData) {
                        var length  = pData.length,
                            lExt    = '.json',
                            lName   = DOM.getCurrentName(lCurrentFile);
                        
                        if (Util.isObject(pData)) {
                            pData = Util.stringifyJSON(pData);
                            
                            if (!Util.checkExtension(lName, lExt))
                                lName += lExt;
                        }
                        
                        if (lHash && length < ONE_MEGABYTE)
                            DOM.saveDataToStorage(lPath, pData, lHash);
                        
                        Util.exec(pCallBack, {
                            data: pData,
                            name: lName
                        });
                    };
                
                if (!Util.isObject(pCallBack))
                    lParams = lFunc;
                else
                    lParams = {
                        success : lFunc,
                        error   : pCallBack.error
                    };
                
                
                if (isDir)
                    DOM.getCurrentFileContent(lParams, lCurrentFile);
                else
                    DOM.checkStorageHash(lPath, function(error, equal, hash) {
                        Util.ifExec(!error && equal, function() {
                                DOM.getDataFromStorage(lPath, lFunc);
                            }, function() {
                                lHash = hash;
                                DOM.getCurrentFileContent(lParams, lCurrentFile);
                            });
                        });
            };
            
            
            /**
             * unified way to save current file content
             *
             * @pCallBack - function({data, name}) {}
             * @pCurrentFile
             */
             this.saveCurrentData             = function(pUrl, pData, pCallBack, pQuery) {
                RESTful.save(pUrl, pData, function() {
                    DOM.saveDataToStorage(pUrl, pData);
                }, pQuery);
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
            this.setCurrentFile          = function(pCurrentFile) {
                var lRet,
                    lCurrentFileWas = this.getCurrentFile();
                
                if (pCurrentFile) {
                    if (lCurrentFileWas)
                        unsetCurrentFile(lCurrentFileWas);
                    
                    this.addClass(pCurrentFile, CURRENT_FILE);
                    
                    /* scrolling to current file */
                    this.scrollIntoViewIfNeeded(pCurrentFile);
                    
                    lRet = true;
                    
                    Cmd.updateCurrentInfo();
                }
                
                return  lRet;
            };
            
            /**
             * select current file
             * @param pCurrent
             */
            this.toggleSelectedFile              = function(pCurrent) {
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lRet        = this.toggleClass(pCurrent, SELECTED_FILE);
                
                return this;
            };
            
            this.toggleAllSelectedFiles         = function(pCurrent) {
                var i, n,
                    isStr       = Util.isString(pCurrent),
                    lCurrent    = !isStr && pCurrent || Cmd.getCurrentFile(),
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
            this.setHistory              = function(pData, pTitle, pUrl) {
                var lRet = window.history;
                
                if (lRet)
                    history.pushState(pData, pTitle, pUrl);
                
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
             * @param pCurrentFile
             */
            this.isCurrentFile           = function(pCurrent) {
                var lRet;
                
                if (pCurrent )
                    lRet = this.isContainClass(pCurrent, CURRENT_FILE);
                
                return lRet;
            };
            
            /**
             * selected file check
             * 
             * @param pCurrentFile
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
             * @param pCurrentFile
             */
            this.isCurrentIsDir            = function(pCurrent) {
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lFileType   = this.getByClass('mini-icon', lCurrent),
                    lRet        = this.isContainClass(lFileType, 'directory');
                
                return lRet;
            };
            
            
           /**
             * get link from current (or param) file
             * 
             * @param pCurrentFile - current file by default
             */
            this.getCurrentLink          = function(pCurrentFile) {
                var lLink = this.getByTag( 'a', pCurrentFile || this.getCurrentFile()),
                    
                    lRet = lLink.length > 0 ? lLink[0] : -1;
                
                return lRet;
            };
            
            /**
             * get link from current (or param) file
             * 
             * @param pCurrentFile - current file by default
             */
            this.getCurrentPath          = function(pCurrentFile) {
                var lCurrent    = pCurrentFile || this.getCurrentFile(),
                    lPath       = this.getCurrentLink( lCurrent ).href;
                
                lPath           = decodeURI(lPath);
                /* убираем адрес хоста*/
                lPath = Util.removeStrOneTime( lPath, [CloudCmd.HOST, CloudFunc.FS] );
                
                return lPath;
            };
            
            /**
             * get name from current (or param) file
             * 
             * @param pCurrentFile
             */
            this.getCurrentName          = function(pCurrentFile) {
                var lCurrent = pCurrentFile || this.getCurrentFile(),
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
             * @param pCurrentFile
             */
            this.setCurrentName          = function(pName, pCurrentFile) {
                var lLink   = this.getCurrentLink( pCurrentFile ),
                    lDir    = this.getCurrentDirName() + '/';
                
                lLink.title = lLink.textContent = pName;
                lLink.href  = lDir + pName;
                
                return lLink;
            };
            
            /**
             * check storage hash 
             */
            this.checkStorageHash       = function(name, callback) {
                DOM.loadCurrentHash(function(loadHash) {
                    var equal, error,
                        nameHash    = name + '-hash',
                        storeHash   = Storage.get(name + '-hash'),
                        isContain   = Util.isContainStr(loadHash, 'error');
                    
                    if (isContain)
                        error = loadHash;
                    else if (loadHash === storeHash)
                        equal = true;
                    
                    Util.exec(callback, error, equal, loadHash);
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
                        nameHash    = name + '-hash',
                        nameData    = name + '-data',
                        allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir();
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else {
                        data    = Storage.get(nameData);
                        hash    = Storage.get(nameHash);
                        
                        Util.exec(callback, data, hash);
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
             * @param pUrl
             */
            this.openWindow              = function(pUrl) {
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
                    
                var lWind       = window.open(pUrl, 'Cloud Commander Auth', lOptions);
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
             * @pCurrent
             */
            this.deleteCurrent           = function(pCurrent, pNextFile, pPreviousFile, pNotSet) {
                var lCurrent    = pCurrent || Cmd.getCurrentFile(),
                    lParent     = lCurrent && lCurrent.parentElement,
                    lName       = Cmd.getCurrentName(lCurrent);
                
                if (lCurrent && lParent && lName !== '..') {
                    var lNext       = pNextFile     || lCurrent.nextSibling,
                        lPrevious   = pPreviousFile || lCurrent.previousSibling;
                        
                        if (!pNotSet)
                            if (lNext)
                                this.setCurrentFile(lNext);
                            else if (lPrevious)
                                this.setCurrentFile(lPrevious);
                        
                        lParent.removeChild(lCurrent);
                }
                
                return lCurrent;
            };
            
             /**
             * remove selected files from file table
             * @Selected
             */
            this.deleteSelected          = function(pSelected) {
                var lSelected = pSelected || this.getSelectedFiles();
                
                if (lSelected) {
                    var n       = lSelected.length,
                        lLast   = n-1,
                        lNext   = lSelected[lLast].nextSibling,
                        lPrev   = lSelected[0].previousSibling;
                    
                    /* lSelected[0] - becouse lSelected is a link to DOM so
                     * when we remove 0 element, it's removed from lSelected to
                     */
                    for(var i = 0; i < n; i++)
                        this.deleteCurrent( lSelected[0], lNext, lPrev, i !== lLast);
                }
                
                return lSelected;
            };
            
            /**
             * rename current file
             * 
             * @pCurrent
             */
            this.renameCurrent            = function(pCurrentFile) {
                if (!Cmd.isCurrentFile(pCurrentFile))
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lFrom       = Cmd.getCurrentName(lCurrent),
                    lTo         = Dialog.prompt('Rename', lFrom) || lFrom,
                    lDirPath    = Cmd.getCurrentDirPath();
                
                if (!Util.strCmp(lFrom, lTo)) {
                    var lFiles      = {
                        from    : lDirPath + lFrom,
                        to      : lDirPath + lTo
                    };
                    
                    RESTful.mv(lFiles, function() {
                        DOM.setCurrentName(lTo, lCurrent);
                    });
                }
            };
            
            /**
             * move current file
             * 
             * @pCurrent
             */
            this.moveCurrent     = function(pCurrentFile) {
                if (!Cmd.isCurrentFile(pCurrentFile))
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                
                lToPath         = Dialog.prompt('Rename/Move file "' + lName + '"', lToPath);
                
                if (lToPath && !Util.strCmp(lFromPath, lToPath)) {
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTful.mv(lFiles, function() {
                        DOM.deleteCurrent(lCurrent);
                        
                        var lPanel  = DOM.getPanel(true),
                        lDotDot     = DOM.getById( '..(' + lPanel.id + ')');
                        
                        DOM.setCurrentFile ( lDotDot );
                        CloudCmd.refresh();
                    });
                }
            };
            
            /**
             * copy current file
             * 
             * @pCurrent
             */
            this.copyCurrent     = function(pCurrentFile) {
                if (!Cmd.isCurrentFile(pCurrentFile))
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                    lToPath     = Dialog.prompt( 'Copy file "' + lName + '" to', lToPath );
                
                if (lToPath && !Util.strCmp(lFromPath, lToPath)) {
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTful.cp(lFiles, function() {
                        var lPanel  = DOM.getPanel(true),
                            lDotDot = DOM.getById( '..(' + lPanel.id + ')');
                        
                        DOM.setCurrentFile ( lDotDot );
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
            
            this.updateCurrentInfo      = function(pCurrent) {
                var info            = Cmd.CurrentInfo,
                    current         = pCurrent || Cmd.getCurrentFile(),
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
        Images                      = Util.extendProto(ImagesProto),
        RESTful                     = Util.extendProto(RESTfulProto),
        Storage                     = Util.extendProto(StorageProto);
    
    DOMProto                        = DOMFunc.prototype = new CmdProto();
    
    Dialog                          = new DialogProto();
    
    Util.extend(DOMProto, [
        DOMTree, {
            Events  : Events,
            RESTful : RESTful,
            Images  : Images,
            Storage   : Storage,
            Dialog  : Dialog
        }
    ]);
    
    DOM                             = new DOMFunc();
    
})(Util);
