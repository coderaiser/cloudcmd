(function(global) {
    'use strict';
    
    var rendy;
    
    if (typeof module === 'object' && module.exports) {
        rendy               = require('rendy');
        module.exports      = new CloudFuncProto();
    } else {
        rendy               = window.rendy;
        global.CloudFunc    = new CloudFuncProto();
    }
    
    function CloudFuncProto() {
        var CloudFunc = this;
        var Entity = new entityProto();
        var FS;
        
        /* КОНСТАНТЫ (общие для клиента и сервера)*/
        
        /* название программы */
        this.NAME = 'Cloud Commander';
        
        /* если в ссылке будет эта строка - в браузере js отключен */
        this.FS = FS = '/fs';
        
        this.apiURL = '/api/v1';
        this.MAX_FILE_SIZE = 500 * 1024;
        this.Entity = Entity;
        
        function entityProto() {
            var Entities = {
                '&nbsp;': ' ',
                '&lt;'  : '<',
                '&gt;'   : '>'
            };
            
            var keys = Object.keys(Entities);
            
            this.encode = function(str) {
                keys.forEach(function(code) {
                    var char = Entities[code];
                    var reg = RegExp(char, 'g');
                    
                    str = str.replace(reg, code);
                });
                
                return str;
            };
            
            this.decode = function(str) {
                keys.forEach(function(code) {
                    var char = Entities[code];
                    var reg = RegExp(code, 'g');
                    
                    str = str.replace(reg, char);
                });
                
                return str;
            };
        }
        
        this.formatMsg = function(msg, name, status) {
            if (!status)
                status = 'ok';
            
            if (name)
                name = '("' + name + '")';
            else
                name = '';
            
            msg = msg + ': ' + status + name;
            
            return msg;
        };
        
        /** Функция возвращает заголовок веб страницы
         * @pPath
         */
        this.getTitle = function(path) {
            if (!CloudFunc.Path)
                CloudFunc.Path = '/';
            
            return  CloudFunc.NAME + ' - ' + (path || CloudFunc.Path);
        };
        
        /** Функция получает адреса каждого каталога в пути
         * возвращаеться массив каталогов
         * @param url -  адрес каталога
         */
        function getPathLink(url, prefix, template) {
            var namesRaw, names, length,
                pathHTML    = '',
                path        = '/';
            
            if (!url)
                throw Error('url could not be empty!');
            
            if (!template)
                throw Error('template could not be empty!');
            
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
                    
                    pathHTML    += rendy(template, {
                        path: path,
                        name: name,
                        slash: slash,
                        prefix: prefix
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
        this.buildFromJSON = function(params) {
            var attribute, size, date, owner, mode,
                dotDot, link, dataName,
                linkResult,
                prefix          = params.prefix,
                template        = params.template,
                templateFile    = template.file,
                templateLink    = template.link,
                json            = params.data,
                files           = json.files,
                path            = json.path,
                
                /*
                 * Строим путь каталога в котором мы находимся
                 * со всеми подкаталогами
                 */
                htmlPath        = getPathLink(path, prefix, template.pathLink);
            
            var fileTable       = rendy(template.path, {
                link        : prefix + FS + path,
                fullPath    : path,
                path        : htmlPath
            });
            
            var header = rendy(templateFile, {
                tag         : 'div',
                attribute   : '',
                className   : 'fm-header',
                type        : '',
                name        : 'name',
                size        : 'size',
                date        : 'date',
                owner       : 'owner',
                mode        : 'mode'
            });
            
            /* сохраняем путь */
            CloudFunc.Path      = path;
            
            fileTable += header + '<ul data-name="js-files" class="files">';
            /* Если мы не в корне */
            if (path !== '/') {
                /* убираем последний слеш и каталог в котором мы сейчас находимся*/
                dotDot = path.substr(path, path.lastIndexOf('/'));
                dotDot = dotDot.substr(dotDot, dotDot.lastIndexOf('/'));
                /* Если предыдущий каталог корневой */
                if (dotDot === '')
                    dotDot = '/';
                
                link = prefix + FS + dotDot;
                
                linkResult = rendy(template.link, {
                    link        : link,
                    title       : '..',
                    name        : '..'
                });
                
                dataName = 'data-name="js-file-.." ';
                attribute = 'draggable="true" ' + dataName;
                
                /* Сохраняем путь к каталогу верхнего уровня*/
                fileTable += rendy(template.file, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    type        : 'directory',
                    name        : linkResult,
                    size        : '&lt;dir&gt;',
                    date        : '--.--.----',
                    owner       : '.',
                    mode        : '--- --- ---'
                });
            }
            
            fileTable += files.map(function(file) {
                var link = prefix + FS + path + file.name;
                
                var type = getType(file.size);
                var attribute = getAttribute(file.size);
                var size = getSize(file.size);
                
                var date = file.date || '--.--.----';
                var owner = file.owner || 'root';
                var mode = file.mode;
                
                var linkResult = rendy(templateLink, {
                    link        : link,
                    title       : file.name,
                    name        : Entity.encode(file.name),
                    attribute   : attribute
                });
                
                var dataName = 'data-name="js-file-' + file.name + '" ';
                var attribute = 'draggable="true" ' + dataName;
                
                return rendy(templateFile, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    type        : type,
                    name        : linkResult,
                    size        : size,
                    date        : date,
                    owner       : owner,
                    mode        : mode
                });
            }).join('');
            
            fileTable += '</ul>';
            
            return fileTable;
        };
        
        function getType(size) {
            if (size === 'dir')
                return 'directory';
            
            return 'text-file'
        };
        
        function getAttribute(size) {
            if (size === 'dir')
                return '';
            
            return 'target="_blank" ';
        }
        
        function getSize(size) {
            if (size === 'dir')
                return '&lt;dir&gt;';
            
            return size;
        }
     }
})(this);

