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
        
        this.apiURL                 = '/api/v1';
        /* id панелей с файлами */
        this.PANEL_LEFT             = 'js-left';
        this.PANEL_RIGHT            = 'js-right';
        this.CHANNEL_CONSOLE        = 'console-data';
        this.CHANNEL_TERMINAL       = 'terminal-data';
        this.CHANNEL_TERMINAL_RESIZE= 'terminal-resize';
        this.MAX_FILE_SIZE          = 500 * 1024;
        
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
                    mode        : '--- --- ---'
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
                mode    = file.mode;
                
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
