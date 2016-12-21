var CloudCmd, Util, DOM, CloudFunc;

(function(Util, window) {
    'use strict';
    
    /* global rendy */
    
    var DOMFunc                     = function() {},
        DOMProto,
        
        ImagesProto                 = function() {
            var Images,
                ImageElementProto   = function() {
                    var LOADING         = 'loading',
                        LoadingImage,
                        HIDDEN          = 'hidden',
                        ERROR           = 'error';
                    
                    function getLoadingType() {
                        return DOM.isSVG() ? '-svg' : '-gif';
                    }
                    
                    function init() {
                        if (LoadingImage)
                            return;
                        
                        LoadingImage = LOADING + getLoadingType();
                    }
                    
                    function getElement() {
                        init();
                        
                        return DOM.load({
                            name        : 'span',
                            id          : 'js-status-image',
                            className   : 'icon',
                            attribute   : 'data-progress',
                            notAppend   : true
                        });
                    }
                    
                    this.get        = getElement;
                    
                    /* Функция создаёт картинку загрузки */
                    this.loading    = function() {
                        var element     = getElement(),
                            classList   = element.classList;
                        
                        classList.add(LOADING, LoadingImage);
                        classList.remove(ERROR, HIDDEN);
                        
                        return element;
                    };
                    
                    /* Функция создаёт картинку ошибки загрузки */
                    this.error      = function() {
                        var element     = getElement(),
                            classList   = element.classList;
                        
                        classList.add(ERROR);
                        classList.remove(HIDDEN, LOADING, LoadingImage);
                        
                        return element;
                    };
            };
            
            Images          = new ImageElementProto();
            
            this.show       = load;
            this.show.load  = load;
            this.show.error = error;
            
            /**
             * Function shows loading spinner
             * position = {top: true};
             */
            function load(position, panel) {
                var current,
                    image           = Images.loading(),
                    parent          = image.parentElement,
                    refreshButton   = DOM.getRefreshButton(panel);
                
                if (position === 'top') {
                    current         = refreshButton.parentElement;
                } else {
                    current         = DOM.getCurrentFile();
                    
                    if (current)
                        current     = DOM.getByDataName('js-name', current);
                    else
                        current     = refreshButton.parentElement;
                }
                
                if (!parent || (parent && parent !== current))
                    current.appendChild(image);
                
                DOM.show(image);
                
                return image;
            }
                
            function error(text) {
                var image = Images.error();
                
                DOM.show(image);
                image.title = text;
                
                CloudCmd.log(text);
                
                return image;
            }
            
            /**
             * hide load image
             */
            this.hide       = function() {
                var element = Images.get();
                DOM.hide(element);
                
                return this;
            };
            
            this.setProgress    = function(value, title) {
                var DATA    = 'data-progress',
                    element = Images.get();
                    
                if (element) {
                    element.setAttribute(DATA, value + '%');
                    
                    if (title)
                        element.title = title;
                }
                
                return this;
            };
                
            this.clearProgress  = function() {
                var DATA    = 'data-progress',
                    element = Images.get();
                    
                 if (element) {
                    element.setAttribute(DATA, '');
                    element.title = '';
                }
                
                return this;
            };
        },
        
        DOMTreeProto                = function() {
            var DOM     = this;
            
            /**
             * check class of element
             *
             * @param element
             * @param pClass
             */
            this.isContainClass          = function(element, className) {
                var ret, classList;
                
                if (!element)
                    throw Error('element could not be empty!');
                
                if (!className)
                    throw Error('className could not be empty!');
                
                classList   = element.classList;
                ret         = classList.contains(className);
                    
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
            this.getById                = function(id, element) {
                return (element || document).querySelector('#' + id);
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
                element.classList.add('hidden');
                return DOM;
            };
            
            this.show                    = function(element) {
                element.classList.remove('hidden');
                return DOM;
            };
        },
        
        CmdProto                    = function() {
            var Cmd                     = this,
                CurrentInfo             = {},
                CURRENT_FILE            = 'current-file',
                SELECTED_FILE           = 'selected-file',
                SelectType              = '*.*',
                TITLE                   = 'Cloud Commander',
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
                    currentFile.classList.remove(CURRENT_FILE);
                
                return ret;
            }
            
            this.loadRemote         = function(name, options, callback) {
                var o           = options,
                    Files       = DOM.Files;
                
                if (!callback)
                    callback = options;
                
                if (o.name && window[o.name])
                    callback();
                else
                    Files.get(['config', 'modules'], function(error, config, modules) {
                        var remoteTmpls, local, remote,
                            load        = DOM.load,
                            prefix      = CloudCmd.PREFIX,
                            online      = config.online && navigator.onLine,
                            
                            remoteObj   = Util.findObjByNameInArr(modules, 'remote'),
                            module      = Util.findObjByNameInArr(remoteObj, name),
                            
                            isArray     = Util.type.array(module.local),
                            version     = module.version,
                            
                            funcON      = function() {
                                load.parallel(remote, function(error) {
                                    if (error)
                                        funcOFF();
                                    else
                                        callback();
                                });
                            },
                            
                            funcOFF     = function() {
                                load.parallel(local, callback);
                            };
                            
                        if (isArray) {
                            remoteTmpls = module.remote;
                            local       = module.local;
                        } else {
                           remoteTmpls  = [module.remote];
                           local        = [module.local];
                        }
                        
                        local   = local.map(function(url) {
                            return prefix + url;
                        });
                        
                        remote  = remoteTmpls.map(function(tmpl) {
                            return rendy(tmpl, {
                                version: version
                            });
                        });
                        
                        Util.exec.if(online, funcON, funcOFF);
                    });
                
                return DOM;
            };
            
            /**
             * load jquery from google cdn or local copy
             * @param callback
             */
            this.loadJquery         = function(callback) {
                DOM.loadRemote('jquery', {
                    name    : '$'
                }, callback);
                
                return DOM;
            };
            
            this.loadSocket         = function(callback) {
                DOM.loadRemote('socket', {
                    name    : 'io'
                }, callback);
                
                return DOM;
            };
            
            /** function loads css and js of Menu
             * @param callback
             */
            this.loadMenu           = function(callback) {
                return DOM.loadRemote('menu', callback);
            };
            
            this.uploadFiles        = function(dir, files) {
                var array,
                    slice   = [].slice,
                    i       = 0,
                    n       = 0,
                    func    = function(name) {
                        return function() {
                            CloudCmd.refresh(null, function() {
                                DOM.setCurrentByName(name);
                            });
                        };
                    },
                    
                    percent = function(i, n, per) {
                        var value;
                        
                        if (!per)
                            per = 100;
                        
                        value = Math.round(i * per / n);
                        
                        return value;
                    },
                    
                    step    = function(n) {
                        return 100 / n;
                    },
                    
                    load    = function(file, callback) {
                        var uploader,
                            Images      = DOM.Images,
                            name        = file.name,
                            path        = dir + name,
                            prefixURL   = CloudCmd.PREFIX_URL,
                            FS          = CloudFunc.FS,
                            api         = prefixURL + FS;
                            
                            ++i;
                            
                            uploader = DOM.load.put(api + path, file);
                            uploader.on('progress', function(count) {
                                var max     = step(n),
                                    value   = (i - 1) * max + percent(count, 100, max);
                                
                                Images.show.load('top');
                                Images.setProgress(Math.round(value));
                            });
                            
                            uploader.on('end', callback);
                    };
                
                if (!files) {
                    files   = dir;
                    dir     = CurrentInfo.dirPath;
                }
                
                n       = files.length;
                array   = slice.call(files);
                
                if (n) {
                    Util.exec.eachSeries(array, load, func(files[0].name));
                }
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
                    Dialog  = DOM.Dialog,
                    path    = '',
                    name    = Cmd.getCurrentName(),
                    dir     = Cmd.getCurrentDirPath(),
                    msg     = 'New ' + typeName || 'File';
                
                if (name === '..')
                    name = '';
                
                Dialog.prompt(TITLE, msg, name, {cancel: false}).then(function(name) {
                    path        = dir + name;
                    
                    if (type)
                        path    += type;
                        
                    if (name)
                        RESTful.write(path, function(error) {
                            !error && CloudCmd.refresh(null, function() {
                                DOM.setCurrentByName(name);
                            });
                        });
                });
            }
            
            /**
             * get current direcotory name
             */
            this.getCurrentDirName           = function() {
                var ret,
                    substr,
                    /* получаем имя каталога в котором находимся */
                    href    = this.getCurrentDirPath();
                
                href    = href.replace(/\/$/, '');
                substr  = href.substr(href, href.lastIndexOf('/'));
                ret     = href.replace(substr + '/', '') || '/';
                
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
                    dirName = DOM.getCurrentDirName() + '/';
                
                if (path !== '/')
                    path = path.replace(RegExp(dirName + '$'), '');
                
                return path;
            };
            
            /**
             * get not current direcotory path
             */
            this.getNotCurrentDirPath       = function() {
                var panel  = this.getPanel({active: false}),
                    path   = this.getCurrentDirPath(panel);
                
                return path;
            };
            
            /**
             * unified way to get current file
             *
             * @currentFile
             */
            this.getCurrentFile             = function() {
                var ret = this.getByClass(CURRENT_FILE);
                
                return ret;
            };
            
            /**
             * get current file by name
             */
            this.getCurrentByName           = function(name, panelParam) {
                var element,
                    panel   = panelParam || CurrentInfo.panel;
                
                name    = 'js-file-' + name;
                element = DOM.getByDataName(name, panel);
                
                return element;
            };
            
            /**
             * unified way to get current file
             *
             * @currentFile
             */
            this.getSelectedFiles         = function() {
                var panel       = DOM.getPanel(),
                    selected    = this.getByClassAll(SELECTED_FILE, panel),
                    ret         = [].slice.call(selected);
                
                return ret;
            };
            
            
            /*
             * unselect all files
             */
            this.unselectFiles          = function(files) {
                var array,
                    isArray = Array.isArray(files);
                
                if (!files) {
                    array = DOM.getSelectedFiles();
                } else if (!isArray)
                    array = [].slice.call(files);
                
                array.forEach(DOM.toggleSelectedFile);
            };
            
            /**
             * get all selected files with current included
             *
             * @currentFile
             */
            this.getActiveFiles         = function() {
                var current     = DOM.getCurrentFile(),
                    files       = DOM.getSelectedFiles(),
                    selected    = ~files.indexOf(current),
                    name        = DOM.getCurrentName(current);
                
                if (!selected && name !== '..')
                    files.push(current);
                
                return files;
            };
            
            /**
             * get size
             * @currentFile
             */
            this.getCurrentSize          = function(currentFile) {
                var current     = currentFile || Cmd.getCurrentFile(),
                    size        = this.getByDataName('js-size', current);
                
                /* если это папка - возвращаем слово dir вместо размера*/
                size    = size
                    .textContent
                    .replace(/^<|>$/g, '');
                
                return size;
            };
            
            /**
             * get size
             * @currentFile
             */
            this.loadCurrentSize          = function(callback, currentFile) {
                var RESTful     = DOM.RESTful,
                    Images      = DOM.Images,
                    current     = currentFile || this.getCurrentFile(),
                    query       = '?size',
                    link        = this.getCurrentPath(current);
                
                Images.show.load();
                
                if (name !== '..')
                    RESTful.read(link + query, function(error, size) {
                        if (!error) {
                            DOM.setCurrentSize(size, current);
                            Util.exec(callback, current);
                            Images.hide();
                        }
                    });
            };
            
            /**
             * load hash
             * @callback
             * @currentFile
             */
            this.loadCurrentHash          = function(callback, currentFile) {
                var RESTful     = DOM.RESTful,
                    current     = currentFile || DOM.getCurrentFile(),
                    query       = '?hash',
                    link        = DOM.getCurrentPath(current);
                
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
                    sizeElement     = this.getByDataName('js-size', current);
                
                sizeElement.textContent = size;
            
            };
            
            /**
             * @currentFile
             */
            this.getCurrentMode          = function(currentFile) {
                var ret,
                    current    = currentFile || this.getCurrentFile(),
                    lMode       = this.getByDataName('js-mode', current);
                    ret        = lMode.textContent;
                
                return ret;
            };
            
            /**
             * @currentFile
             */
            this.getCurrentOwner         = function(currentFile) {
                var ret,
                    current     = currentFile || this.getCurrentFile(),
                    owner       = this.getByDataName('js-owner', current);
                
                ret             = owner.textContent;
                
                return ret;
            };
            
            /**
             * unified way to get current file content
             *
             * @param callback
             * @param currentFile
             */
             this.getCurrentData             = function(callback, currentFile) {
                var hash,
                    RESTful         = DOM.RESTful,
                    Dialog          = DOM.Dialog,
                    Info            = DOM.CurrentInfo,
                    current         = currentFile || DOM.getCurrentFile(),
                    path            = DOM.getCurrentPath(current),
                    isDir           = DOM.isCurrentIsDir(current),
                    
                    func            = function(error, data) {
                        var length,
                           ONE_MEGABYTE    = 1024 * 1024 * 1024;
                        
                        if (!error) {
                            if (Util.type.object(data))
                                data = Util.json.stringify(data);
                            
                            length  = data.length;
                            
                            if (hash && length < ONE_MEGABYTE)
                                DOM.saveDataToStorage(path, data, hash);
                        }
                        
                        callback(error, data);
                    };
                
                if (Info.name === '..') {
                    Dialog.alert.noFiles(TITLE);
                    callback(Error('No files selected!'));
                } else if (isDir) {
                    RESTful.read(path, func);
                } else {
                    DOM.checkStorageHash(path, function(error, equal, hashNew) {
                        if (error) {
                            callback(error);
                        } else if (equal) {
                            DOM.getDataFromStorage(path, callback);
                        } else {
                            hash = hashNew;
                            RESTful.read(path, func);
                        }
                    });
                }
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
                
                DOM.RESTful.write(url + query, data, function(error) {
                    !error && DOM.saveDataToStorage(url, data);
                });
            };
            
            /**
             * unified way to get RefreshButton
             */
            this.getRefreshButton        = function(panel) {
                var currentPanel    = panel || this.getPanel(),
                    refresh         = this.getByDataName('js-refresh', currentPanel);
                
                return refresh;
            };
            
            this.setCurrentByName = function(name) {
                var current = this.getCurrentByName(name)
                return this.setCurrentFile(current);
            }
            
            /**
             * unified way to set current file
             */
            this.setCurrentFile = function(currentFile, options) {
                var path, pathWas, title,
                    o               = options,
                    FS              = CloudFunc.FS,
                    CENTER          = true,
                    currentFileWas  = this.getCurrentFile();
                
                if (currentFile) {
                    if (currentFileWas) {
                        pathWas     = DOM.getCurrentDirPath();
                        unsetCurrentFile(currentFileWas);
                    }
                    
                    currentFile.classList.add(CURRENT_FILE);
                    
                    path        = DOM.getCurrentDirPath();
                    
                    if (path !== pathWas) {
                        title   = CloudFunc.getTitle(path);
                        this.setTitle(title);
                        
                        /* history could be present
                         * but it should be false
                         * to prevent default behavior
                         */
                        if (!o || o.history !== false) {
                            if (path !== '/')
                                path    = FS + path;
                            
                            DOM.setHistory(path, null, path);
                        }
                    }
                    
                    /* scrolling to current file */
                    this.scrollIntoViewIfNeeded(currentFile, CENTER);
                    
                    Cmd.updateCurrentInfo();
                }
                
                return this;
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
                
                isChild = /A|SPAN|LI/.test(tag);
                
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
                
                if (element && element.tagName !== 'LI')
                    element = null;
                
                return element;
            };
            
            /**
             * select current file
             * @param currentFile
             */
            this.toggleSelectedFile              = function(currentFile) {
                var current     = currentFile || this.getCurrentFile();
                    
                current.classList.toggle(SELECTED_FILE);
                
                return Cmd;
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
                
                for (; i < n; i++)
                    DOM.toggleSelectedFile(files[i]);
                
                return Cmd;
            };
            
            function selectByPattern(msg, files) {
                var n, regExp,
                    Dialog      = DOM.Dialog,
                    allMsg      = 'Specify file type for ' + msg + ' selection',
                    i           = 0,
                    matches     = 0,
                    name,
                    shouldSel   = msg === 'expand',
                    isSelected, isMatch,
                    current;
                
                Dialog.prompt(TITLE, allMsg, SelectType, {cancel: false}).then(function(type) {
                    SelectType  = type;
                    
                    regExp      = Util.getRegExp(type);
                    
                    n           = files && files.length;
                    for (i = 0; i < n; i++) {
                        current = files[i];
                        name    = DOM.getCurrentName(current);
                            
                        if (name !== '..') {
                            isMatch     = regExp.test(name);
                            
                            if (isMatch) {
                                ++matches;
                                
                                isSelected  = DOM.isSelected(current);
                                
                                if (shouldSel)
                                    isSelected = !isSelected;
                                
                                if (isSelected)
                                    DOM.toggleSelectedFile(current);
                            }
                        }
                    }
                    
                    if (!matches)
                        Dialog.alert('Select Files', 'No matches found!');
                });
            }
            
            /**
             * open dialog with expand selection
             */
            this.expandSelection                = function() {
                var msg     = 'expand',
                    files   = CurrentInfo.files;
                
                selectByPattern(msg, files);
            };
            
            /**
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
            this.setHistory              = function(data, title, url) {
                var ret = window.history;
                
                url = CloudCmd.PREFIX + url;
                
                if (ret)
                    history.pushState(data, title, url);
                
                return ret;
            };
            
            /**
             * set title or create title element
             *
             * @param name
             */
            
            this.setTitle                = function(name) {
                if (!Title)
                    Title = DOM.getByTag('title')[0] ||
                            DOM.load({
                                name            : 'title',
                                innerHTML       : name,
                                parentElement   : document.head
                            });
                
                Title.textContent = name;
                
                return this;
            };
            
            /**
             * current file check
             *
             * @param currentFile
             */
            this.isCurrentFile           = function(currentFile) {
                var ret;
                
                if (currentFile)
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
                
                if (pSelected)
                    ret = this.isContainClass(pSelected, SELECTED_FILE);
                
                return ret;
            };
            
            /**
             * check is current file is a directory
             *
             * @param currentFile
             */
            this.isCurrentIsDir            = function(currentFile) {
                var current    = currentFile || this.getCurrentFile(),
                    fileType   = this.getByDataName('js-type', current),
                    ret        = this.isContainClass(fileType, 'directory');
                
                return ret;
            };
            
           /**
             * get link from current (or param) file
             *
             * @param currentFile - current file by default
             */
            this.getCurrentLink          = function(currentFile) {
                var current = currentFile || this.getCurrentFile(),
                    link    = this.getByTag('a', current);
                
                return link[0];
            };
            
            /**
             * get link from current (or param) file
             *
             * @param currentFile - current file by default
             */
            this.getCurrentPath          = function(currentFile) {
                var current     = currentFile || DOM.getCurrentFile(),
                    element     = DOM.getByTag('a', current)[0],
                    path        = element.getAttribute('href'),
                    prefix      = CloudCmd.PREFIX,
                    fs          = CloudFunc.FS;
                
                path            = path.replace(RegExp('^' + prefix + fs), '');
                
                return path;
            };
            
            /**
             * get name from current (or param) file
             *
             * @param currentFile
             */
            this.getCurrentName          = function(currentFile) {
                var link,
                    name        = '',
                    current     = currentFile || this.getCurrentFile();
                
                if (current)
                    link        = this.getCurrentLink(current);
                    
                if (link) {
                    name = link.title;
                }
                
                return name;
            };
            
            this.getFilenames           = function(allFiles) {
                var first, name,
                    files,
                    slice   = Array.prototype.slice,
                    names   = [];
                
                if (!allFiles)
                    throw Error('AllFiles could not be empty');
                
                files           = slice.call(allFiles);
                first           = files[0];
                
                if (first) {
                    name        = this.getCurrentName(first);
                } else {
                    first       = this.getCurrentFile();
                    name        = this.getCurrentName(first);
                }
                
                if (name === '..')
                    files.shift();
                
                names = files.map(function(current) {
                    return DOM.getCurrentName(current);
                });
                
                return names;
            };
            
            /**
             * set name from current (or param) file
             *
             * @param name
             * @param current
             */
            this.setCurrentName          = function(name, current) {
                var Info        = CurrentInfo,
                    link        = Info.link,
                    FS          = CloudFunc.FS,
                    PREFIX      = CloudCmd.PREFIX,
                    dir         = PREFIX + FS + Info.dirPath;
                
                link.title      = name;
                link.innerHTML  = CloudFunc.Entity.encode(name);
                link.href       = dir + name;
                
                current.setAttribute('data-name', 'js-file-' + name);
                
                return link;
            };
            
            /**
             * check storage hash
             */
            this.checkStorageHash       = function(name, callback) {
                var Storage         = DOM.Storage,
                    parallel        = Util.exec.parallel,
                    loadHash        = DOM.loadCurrentHash,
                    nameHash        = name + '-hash',
                    getStoreHash    = Util.exec.with(Storage.get, nameHash);
                
                Util.check(arguments, ['name', 'callback']);
                
                parallel([loadHash, getStoreHash], function(error, loadHash, storeHash) {
                    var equal,
                        isContain   = /error/.test(loadHash);
                    
                    if (isContain)
                        error = loadHash;
                    else if (loadHash === storeHash)
                        equal = true;
                    
                    callback(error, equal, loadHash);
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
                DOM.Files.get('config', function(error, config) {
                    var allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir(),
                        nameHash    = name + '-hash',
                        nameData    = name + '-data';
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else
                        Util.exec.if(hash, function() {
                            var Storage = DOM.Storage;
                            
                            Storage.set(nameHash, hash);
                            Storage.set(nameData, data);
                            
                            Util.exec(callback, hash);
                        }, function(callback) {
                            DOM.loadCurrentHash(function(error, loadHash) {
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
                DOM.Files.get('config', function(error, config) {
                    var Storage     = DOM.Storage,
                        nameHash    = name + '-hash',
                        nameData    = name + '-data',
                        allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir();
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else {
                        Util.exec.parallel([
                            function(callback) {
                                Storage.get(nameData, callback);
                            },
                            function(callback) {
                                Storage.get(nameHash, callback);
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
             * @param options = {active: true}
             */
            this.getPanel                = function(options) {
                var files, panel, isLeft,
                    dataName    = 'js-',
                    current     = this.getCurrentFile();
                
                if (!current) {
                    panel       = this.getByDataName('js-left');
                } else {
                    files       = current.parentElement,
                    panel       = files.parentElement,
                    isLeft      = panel.getAttribute('data-name') === 'js-left';
                }
                    
                /* if {active : false} getting passive panel */
                if (options && !options.active) {
                    dataName    += isLeft ? 'right' : 'left';
                    panel       = this.getByDataName(dataName);
                }
                
                /* if two panels showed
                 * then always work with passive
                 * panel
                 */
                if (window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH)
                    panel = this.getByDataName('js-left');
                    
                
                if (!panel)
                    throw Error('can not find Active Panel!');
                    
                return panel;
            };
            
            this.getFiles               = function(element) {
                var files   = DOM.getByDataName('js-files', element),
                    ret     = files.children || [];
                
                return ret;
            };
            
            /**
             * shows panel right or left (or active)
             */
            this.showPanel               = function(active) {
                var ret     = true,
                    panel   = this.getPanel({active: active});
                                
                if (panel)
                    this.show(panel);
                else
                    ret = false;
                
                return ret;
            };
            
            /**
             * hides panel right or left (or active)
             */
            this.hidePanel               = function(active) {
                var ret     = false,
                    panel   = this.getPanel({active: active});
                
                if (panel)
                    ret = this.hide(panel);
                
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
                    DOM.Dialog.alert(TITLE, 'Please disable your popup blocker and try again.');
                
                return wnd;
            };
            
            /**
             * remove child of element
             * @param pChild
             * @param element
             */
            this.remove                  = function(child, element) {
                var parent = element || document.body;
                
                parent.removeChild(child);
                    
                return DOM;
            };
            
            /**
             * remove current file from file table
             * @param current
             *
             */
            this.deleteCurrent           = function(current) {
                var next, prev, currentNew;
                
                if (!current)
                    Cmd.getCurrentFile();
                
                var parent = current && current.parentElement;
                var name = Cmd.getCurrentName(current);
                
                if (current && name !== '..') {
                    next    = current.nextSibling,
                    prev    = current.previousSibling;
                        
                    if (next)
                        currentNew = next;
                    else if (prev)
                        currentNew = prev;
                    
                    DOM.setCurrentFile(currentNew);
                    
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
                        DOM.deleteCurrent(current);
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
                var from, dirPath, files, isExist,
                    RESTful     = DOM.RESTful,
                    Dialog      = DOM.Dialog;
                
                if (!Cmd.isCurrentFile(current))
                    current = Cmd.getCurrentFile();
                
                from        = Cmd.getCurrentName(current);
                
                if (from === '..')
                    Dialog.alert.noFiles(TITLE);
                else
                    Dialog.prompt(TITLE, 'Rename', from, {cancel: false}).then(function(to) {
                        isExist     = !!DOM.getCurrentByName(to);
                        dirPath     = Cmd.getCurrentDirPath();
                        
                        if (from !== to) {
                            files      = {
                                from    : dirPath + from,
                                to      : dirPath + to
                            };
                            
                            RESTful.mv(files, function(error) {
                                var Storage = DOM.Storage;
                                
                                if (!error) {
                                    DOM.setCurrentName(to, current);
                                    Cmd.updateCurrentInfo();
                                    Storage.remove(dirPath);
                                    
                                    if (isExist)
                                        CloudCmd.refresh();
                                }
                            });
                        }
                    });
            };
            
            /**
             * unified way to scrollIntoViewIfNeeded
             * (native suporte by webkit only)
             * @param element
             * @param pCenter
             */
            this.scrollIntoViewIfNeeded  = function(element, center) {
                var ret = element && element.scrollIntoViewIfNeeded;
                
                /* for scroll as small as possible
                 * param should be false
                 */
                if (arguments.length === 1)
                    center = false;
                
                if (ret)
                    element.scrollIntoViewIfNeeded(center);
                
                return ret;
            };
            
            /* scroll on one page*/
            this.scrollByPages           = function(element, pPages) {
               var ret = element && element.scrollByPages && pPages;
                
                if (ret)
                    element.scrollByPages(pPages);
                
                return ret;
            };
            
            this.changePanel            = function() {
                var dataName, files, current,
                    
                    panel           = DOM.getPanel(),
                    panelPassive    = DOM.getPanel({
                        active: false
                    }),
                    
                    name            = DOM.getCurrentName(),
                    
                    filesPassive    = DOM.getFiles(panelPassive);
                
                dataName            = panel.getAttribute('data-name');
                TabPanel[dataName]  = name;
                
                panel           = panelPassive;
                dataName        = panel.getAttribute('data-name');
                
                name            = TabPanel[dataName];
                
                if (name) {
                    current     = DOM.getCurrentByName(name, panel);
                    
                    if (current)
                        files       = current.parentElement;
                }
                
                if (!files || !files.parentElement) {
                    current     = DOM.getCurrentByName(name, panel);
                    
                    if (!current)
                        current = filesPassive[0];
                }
                
                DOM.setCurrentFile(current, {
                    history: true
                });
                
                return this;
            };
            
            this.getPackerExt = function(type) {
                if (type === 'zip')
                    return '.zip';
                
                return '.tar.gz';
            }
            
            this.goToDirectory          = function() {
                var msg     = 'Go to directory:',
                    path    = CurrentInfo.dirPath,
                    Dialog  = DOM.Dialog;
                
                Dialog.prompt(TITLE, msg, path, {cancel: false}).then(function(path) {
                    CloudCmd.loadDir({
                        path: path
                    });
                });
            },
            
            this.duplicatePanel         = function() {
                var isDir = CurrentInfo.isDir;
                var path = CurrentInfo.dirPath;
                var panel = CurrentInfo.panelPassive;
                var noCurrent = !CurrentInfo.isOnePanel;
                
                if (isDir)
                    path = CurrentInfo.path;
                
                CloudCmd.loadDir({
                    path: path,
                    panel: panel,
                    noCurrent: noCurrent,
                });
            };
            
            this.swapPanels             = function() {
                var Info            = CurrentInfo,
                    panel           = Info.panel,
                    panelPassive    = Info.panelPassive,
                    
                    currentIndex    = [].indexOf.call(Info.files, Info.element),
                    
                    dirPath         = DOM.getCurrentDirPath(),
                    dirPathPassive  = DOM.getNotCurrentDirPath();
                
                 CloudCmd.loadDir({
                    path: dirPath,
                    panel: panelPassive,
                    noCurrent: true
                });
                
                CloudCmd.loadDir({
                    path: dirPathPassive,
                    panel: panel
                }, function() {
                    var el,
                        files   = Info.files,
                        length  = files.length - 1;
                    
                    if (currentIndex > length)
                        currentIndex = length;
                    
                    el = files[currentIndex];
                    
                    DOM.setCurrentFile(el);
                });
            };
            
            this.CurrentInfo            = CurrentInfo,
            
            this.updateCurrentInfo      = function(currentFile) {
                var info            = Cmd.CurrentInfo,
                    current         = currentFile || Cmd.getCurrentFile(),
                    files           = current.parentElement,
                    panel           = files.parentElement,
                    
                    panelPassive    = Cmd.getPanel({
                        active: false
                    }),
                    
                    filesPassive    = DOM.getFiles(panelPassive),
                    
                    name            = Cmd.getCurrentName(current);
                
                info.dir            = Cmd.getCurrentDirName();
                info.dirPath        = Cmd.getCurrentDirPath();
                info.parentDirPath  = Cmd.getParentDirPath();
                info.element        = current;
                info.ext            = Util.getExt(name);
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
                info.isOnePanel     =
                    info.panel.getAttribute('data-name') ===
                    info.panelPassive.getAttribute('data-name');
            };
        
        },
        
        DOMTree                     = Util.extendProto(DOMTreeProto),
        Images                      = Util.extendProto(ImagesProto);
    
    DOMProto                        = DOMFunc.prototype = new CmdProto();
    
    Util.extend(DOMProto, [
        DOMTree, {
            Images  : Images
        }
    ]);
    
    DOM                             = new DOMFunc();
    
})(Util, window);
