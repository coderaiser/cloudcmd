var Util;

(function(scope, Util) {
    'use strict';
    
    
    if (typeof module === 'object' && module.exports) {
        Util            = require('./util');
        module.exports  = new CloudFuncProto(Util);
    } else {
        scope.CloudFunc = new CloudFuncProto(Util);
    }
    
    function CloudFuncProto(Util) {
        var CloudFunc               = this,
            FS,
            JOIN                    = '/join/';
        
        /* КОНСТАНТЫ (общие для клиента и сервера)*/
        
        /* название программы */
        this.NAME                   = 'Cloud Commander';
        
        /* если в ссылке будет эта строка - в браузере js отключен */
        this.FS    =   FS           = '/fs';
        
        /* название css-класа кнопки обновления файловой структуры*/
        this.REFRESHICON            = 'refresh-icon';
        
        this.apiURL                 = '/api/v1';
        /* id панелей с файлами */
        this.PANEL_LEFT             = 'js-left';
        this.PANEL_RIGHT            = 'js-right';
        this.CHANNEL_CONSOLE        = 'console-data';
        this.CHANNEL_TERMINAL       = 'terminal-data';
        this.CHANNEL_TERMINAL_RESIZE= 'terminal-resize';
        this.MAX_FILE_SIZE          = 500 * 1024;
        
        this.addListener            = function(name, func, allListeners, socket) {
            var listeners, obj,
                type    = Util.getType(name);
            
            switch(type) {
            case 'string':
                listeners       = allListeners[name];
                
                if (!listeners)
                    listeners   = allListeners[name] = [];
                
                listeners.push(func);
                
                if (func && socket)
                    socket.on(name, func);
                
                break;
            
            case 'object':
                obj = name;
                
                Object.keys(obj).forEach(function(name) {
                    func = obj[name];
                    CloudFunc.addListener(name, func, allListeners, socket);
                });
                
                break;
            }
            
            return this;
        };
        
        this.removeListener         = function(name, func, allListeners, socket) {
            var listeners;
            
            if (socket)
                socket.removeListener(name, func);
            
            listeners   = allListeners[name];
            
            if (listeners)
                listeners = listeners.map(function(listener) {
                    if (listener === func)
                        listener = null;
                    
                    return listener;
                });
            
            return this;
        };
        
          /**
         * ad new line (if it's not)
         * @param {string} pText
         */
        this.addNewLine             = function(text) {
            var newLine    = '',
                n           = text && text.length;
            
            if(n && text[n-1] !== '\n')
                newLine = '\n';
            
            return text + newLine;
        };
        
        /**
         * rm new line (if it's)
         * @param {string} pText
         */
        this.rmNewLine             = function(text) {
            var strs    = ['\n', '\r'],
                str     = Util.rmStr(text, strs);
            
            return str;
        };
        
        this.getJoinURL             = function(names) {
            var url,
                regExp      = new RegExp(',', 'g'),
                nameStr     = names + '';
                
            nameStr         = nameStr.replace(regExp, ':');
            nameStr         = this.rmFirstSlash(nameStr);
            url             = JOIN + nameStr;
            
            return url;
        };
        
        this.getJoinArray           = function(url) {
            var str     = Util.rmStrOnce(url, JOIN),
                names   = str.split(':');
            
            return names;
        };
        
        this.isJoinURL              = function(url) {
            var ret = Util.isContainStrAtBegin(url, JOIN);
            
            return ret;
        };
        
        this.formatMsg              = function(msg, name, status) {
            if (!status)
                status = 'ok';
            
            if (name)
                name = '("' + name + '")';
            else
                name = '';
            
            
            msg = msg + ': ' + status + name;
            
            return msg;
        };
        /**
         * Функция убирает последний слеш,
         * если он - последний символ строки
         */
        this.rmLastSlash            = function(path) {
            var length, lastSlash, isStr, isEqual;
            
            if (path) {
                isStr       = Util.isString(path);
                length      = path.length - 1;
                lastSlash   = path.lastIndexOf('/');
                isEqual     = lastSlash === length;
                
                if (isStr && isEqual)
                    path = path.substr(path, length);
            }
            
            return path;
        };
        
        this.rmFirstSlash           = function(str) {
            var ret         = str,
                isContain   = Util.isContainStrAtBegin(str, '/');
            
            if (isContain)
                ret         = Util.rmStrOnce(str, '/');
            
            return ret;
        };
        
        /** Функция возвращает заголовок веб страницы
         * @pPath
         */
        this.getTitle               = function(pPath) {
            if (!CloudFunc.Path)
                CloudFunc.Path = '/';
                
            return  CloudFunc.NAME + ' - ' + (pPath || CloudFunc.Path);
                
        };
        /**
         * Функция переводит права из цыфрового вида в символьный 
         * @param pPerm_s - строка с правами доступа
         * к файлу в 8-миричной системе
         */
        this.getSymbolicPermissions = function(pPerm_s) {
            var lType, lOwner, lGroup, lAll,
                perms           = pPerm_s && pPerm_s.toString(),
                lPermissions    = perms;
            /*
                S_IRUSR   0000400   protection: readable by owner
                S_IWUSR   0000200   writable by owner
                S_IXUSR   0000100   executable by owner
                S_IRGRP   0000040   readable by group
                S_IWGRP   0000020   writable by group
                S_IXGRP   0000010   executable by group
                S_IROTH   0000004   readable by all
                S_IWOTH   0000002   writable by all
                S_IXOTH   0000001   executable by all
            */
            if (perms) {
                /* тип файла */
                lType = perms.toString().charAt(0);
                
                switch (lType-0) {
                    case 1: /* обычный файл */
                        lType='-';
                        break;
                    case 2: /* байт-ориентированное (символьное) устройство*/
                        lType='c';
                        break;
                    case 4: /* каталог */
                        lType='d';
                        break;            
                    default:
                        lType='-';
                }
                
                /* оставляем последние 3 символа*/
                perms = perms.length > 5 ? perms.substr(3) : perms.substr(2);
                
                /* Рекомендации гугла советуют вместо string[3]
                 * использовать string.charAt(3)
                 */
                /*    
                    http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml?showone=Standards_features#Standards_features
                    
                    Always preferred over non-standards featuresFor
                    maximum portability and compatibility, always 
                    prefer standards features over non-standards 
                    features (e.g., string.charAt(3) over string[3]
                    and element access with DOM functions instead
                    of using an application-specific shorthand).
                */
                /* Переводим в двоичную систему */
                lOwner = (perms[0] - 0).toString(2),
                lGroup = (perms[1] - 0).toString(2),
                lAll   = (perms[2] - 0).toString(2),
                
                /* переводим в символьную систему*/
                lPermissions =
                             (lOwner[0] - 0 > 0 ? 'r' : '-')    +
                             (lOwner[1] - 0 > 0 ? 'w' : '-')    +
                             (lOwner[2] - 0 > 0 ? 'x' : '-')    +
                             ' '                                +
                             (lGroup[0] - 0 > 0 ? 'r' : '-')    +
                             (lGroup[1] - 0 > 0 ? 'w' : '-')    +
                             (lGroup[2] - 0 > 0 ? 'x' : '-')    +
                             ' '                                +
                             (lAll[0]- 0    > 0 ? 'r' : '-')    +
                             (lAll[1]- 0    > 0 ? 'w' : '-')    +
                             (lAll[2]- 0    > 0 ? 'x' : '-');
            }
            
            return lPermissions;
        };
        
        /**
         * Функция конвертирует права доступа к файлам из символьного вида
         * в цыфровой
         */
        this.getNumericPermissions  = function(pPerm_s) {
            var owner, group, all,
                perms   = pPerm_s,
                length  = perms && perms.length === 11;
            
            if (length) {
                owner   = (pPerm_s[0]  === 'r' ? 4 : 0) +
                          (pPerm_s[1]  === 'w' ? 2 : 0) +
                          (pPerm_s[2]  === 'x' ? 1 : 0),
                            
                group   = (pPerm_s[4]  === 'r' ? 4 : 0) +
                          (pPerm_s[5]  === 'w' ? 2 : 0) +
                          (pPerm_s[6]  === 'x' ? 1 : 0),
                        
                all     = (pPerm_s[8]  === 'r' ? 4 : 0) +
                          (pPerm_s[9]  === 'w' ? 2 : 0) +
                          (pPerm_s[10] === 'x' ? 1 : 0);
                
                /* добавляем 2 цифры до 5 */
                perms   = '00' + owner + group + all;
            }
            
            return perms;
        };
        
        /** Функция получает адреса каждого каталога в пути
         * возвращаеться массив каталогов
         * @param url -  адрес каталога
         */
        function getPathLink(url, template) {
            var namesRaw, names, length,
                pathHTML    = '',
                path        = '/';
            
            Util.checkArgs(arguments, ['url', 'template']);
            
            namesRaw    = url.split('/')
                             .slice(1, -1),
            
            names       = [].concat('/', namesRaw),
            
            length      = names.length - 1;
            
            names.forEach(function(name, index) {
                var slash       = '',
                    isLast      = index === length;
                
                if (index)
                    path        += name + '/';
                
                if (index && isLast) {
                    pathHTML    += name + '/';
                } else {
                    if (index)
                        slash = '/';
                    
                    pathHTML    += Util.render(template, {
                        path: path,
                        name: name,
                        slash: slash
                    });
                }
            });
            
            return pathHTML;
        }
        
        /**
         * Функция строит таблицу файлв из JSON-информации о файлах
         * @param params - информация о файлах 
         *
         */
        this.buildFromJSON          = function(params) {
            var file, i, n, type, attribute, size, owner, mode,
                /* ссылка на верхний каталог*/
                dotDot, link, dataName,
                linkResult,
                template        = params.template,
                templateFile    = template.file,
                templateLink    = template.link,
                json            = params.data,
                files           = json.files,
                /* сохраняем путь каталога в котором мы сейчас находимся*/
                path            = json.path,
                
                /* 
                 * Строим путь каталога в котором мы находимся
                 * со всеми подкаталогами
                 */
                htmlPath        = getPathLink(path, template.pathLink),
                
                /* Убираем последний слэш
                 * с пути для кнопки обновить страницу
                 * если он есть
                 */
                refreshPath    = CloudFunc.rmLastSlash(path),
                
                fileTable       = Util.render(template.path, {
                    link        : FS + refreshPath,
                    fullPath    : path,
                    path        : htmlPath
                }),
                
                header         = Util.render(templateFile, {
                    tag         : 'div',
                    attribute   : '',
                    className   : 'fm-header',
                    type        : '',
                    name        : 'name',
                    size        : 'size',
                    owner       : 'owner',
                    mode        : 'mode'
                });
            
            fileTable          += header;
            
            /* сохраняем путь */
            CloudFunc.Path      = path;
            
            fileTable           += '<ul data-name="js-files" class="files">';
            /* Если мы не в корне */
            if (path !== '/') {
                /* убираем последний слеш и каталог в котором мы сейчас находимся*/
                dotDot          = path.substr(path, path.lastIndexOf('/'));
                dotDot          = dotDot.substr(dotDot, dotDot.lastIndexOf('/'));
                /* Если предыдущий каталог корневой */
                if (dotDot === '')
                    dotDot = '/';
                
                link            = FS + dotDot;
                
                linkResult      = Util.render(template.link, {
                    link        : link,
                    name        : '..'
                });
                
                dataName        = 'data-name="js-file-.." ',
                attribute       = 'draggable="true" ' + dataName,
                /* Сохраняем путь к каталогу верхнего уровня*/
                fileTable += Util.render(template.file, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    type        : 'directory',
                    name        : linkResult,
                    size        : '&lt;dir&gt;',
                    owner       : '.',
                    mode        : CloudFunc.getSymbolicPermissions('.')
                });
            }
            
            n = files.length;
            for (i = 0; i < n; i++) {
                file            = files[i];
                link            = FS + path + file.name;
                
                if (file.size === 'dir') {
                    type        = 'directory';
                    attribute   = '';
                    size        = '&lt;dir&gt;';
                } else {
                    type        = 'text-file';
                    attribute   = 'target="_blank" ';
                    size        = file.size;
                }
                
                owner   = file.owner || 'root';
                mode    = CloudFunc.getSymbolicPermissions(file.mode);
                
                linkResult  = Util.render(templateLink, {
                    link        : link,
                    name        : file.name,
                    attribute   : attribute
                });
                
                dataName        = 'data-name="js-file-' + file.name + '" ';
                attribute       = 'draggable="true" ' + dataName;
                
                fileTable += Util.render(templateFile, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    /* Если папка - выводим пиктограмму папки   *
                     * В противоположном случае - файла         */
                    type        : type,
                    name        : linkResult,
                    size        : size,
                    owner       : owner,
                    mode        : mode
                });
            }
            
            fileTable          += '</ul>';
            
            return fileTable;
        };
     }
})(this, Util);
