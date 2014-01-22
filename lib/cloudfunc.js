var Util;

(function(scope, Util) {
    'use strict';
    
    /** 
     * Модуль, содержащий функции, которые
     * будут работать и на клиенте и на сервере  
     */
     
    if (scope.window) {
        scope.CloudFunc = new CloudFuncProto(Util);
    } else {
        if (!global.cloudcmd)
            return console.log(
                '# cloudfunc.js'                                    + '\n'  +
                '# -----------'                                     + '\n'  +
                '# Module is part of Cloud Commander,'              + '\n'  +
                '# used for generate html from json.'               + '\n'  +
                '#'                                                 + '\n'  +
                '# http://cloudcmd.io'                              + '\n');
        
        Util            = global.cloudcmd.main.util;
        
        module.exports  = new CloudFuncProto(Util);
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
        
        /* id панелей с файлами */
        this.PANEL_LEFT             = 'js-left';
        this.PANEL_RIGHT            = 'js-right';
        
        this.getJoinURL             = function(names) {
            var url, isContain,
                regExp      = new RegExp(',', 'g'),
                nameStr     = names + '';
                
            nameStr         = nameStr.replace(regExp, ':');
            nameStr         = this.rmFirstSlash(nameStr);
            url             = JOIN + nameStr;
            
            return url;
        };
        
        this.getJoinArray           = function(url) {
            var str     = Util.removeStrOneTime(url, JOIN),
                names   = str.split(':');
            
            return names;
        };
        
        this.isJoinURL              = function(url) {
            var ret = Util.isContainStrAtBegin(url, JOIN);
            
            return ret;
        };
        
        this.formatMsg              = function(pMsg, pName, pStatus) {
            var status  = pStatus || 'ok',
                name    = !pName ? '': '("' + pName + '")',
                msg     = pMsg + ': ' + status + name;
            
            return msg;
        };
        /**
         * Функция убирает последний слеш,
         * если он - последний символ строки
         */
        this.rmLastSlash            = function(pPath) {
            var lRet        = pPath,
                lIsStr      = Util.isString(pPath),
                lLengh      = pPath.length-1,
                lLastSlash  = pPath.lastIndexOf('/');
                
            if (lIsStr && lLastSlash === lLengh)
                lRet = pPath.substr(pPath, lLengh);
            
            return lRet;
        };
        
        this.rmFirstSlash           = function(str) {
            var ret         = str,
                isContain   = Util.isContainStrAtBegin(str, '/');
            
            if (isContain)
                ret         = Util.removeStrOneTime(str, '/');
            
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
        
        /** Функция получает короткие размеры
         * конвертируя байт в килобайты, мегабойты,
         * гигайбайты и терабайты
         * @pSize - размер в байтах
         */
        this.getShortSize           = function(pSize) {
            if (pSize === pSize-0) {
                /* Константы размеров, что используются внутри функции */
                var l1KB = 1024,
                    l1MB = l1KB * l1KB,
                    l1GB = l1MB * l1KB,
                    l1TB = l1GB * l1KB,
                    l1PB = l1TB * l1KB;
                
                if      (pSize < l1KB)   pSize = pSize + 'b';
                else if (pSize < l1MB)   pSize = (pSize/l1KB).toFixed(2) + 'kb';
                else if (pSize < l1GB)   pSize = (pSize/l1MB).toFixed(2) + 'mb';
                else if (pSize < l1TB)   pSize = (pSize/l1GB).toFixed(2) + 'gb';
                else if (pSize < l1PB)   pSize = (pSize/l1TB).toFixed(2) + 'tb';
                else                     pSize = (pSize/l1PB).toFixed(2) + 'pb';
            }
            
            return pSize;
        };
        
        /** Функция получает адреса каждого каталога в пути
         * возвращаеться массив каталогов
         * @param url -  адрес каталога
         */
        function getDirPath(url) {
            var lShortName,
                folders     = [],
                i;
            
            do {
                folders.push(url);
                url = url.substr(url, url.lastIndexOf('/'));
            } while (url !== '');
                    
            /* Формируем ссылки на каждый каталог в пути */
            var lHref       = '<a href="',
                lTitle      = '" title="',
                _l          = '">',
                lHrefEnd    ='</a>',
                
                /* корневой каталог */
                lHtmlPath   = lHref   + FS    + lTitle  +
                              '/'     + _l      + '/'   +
                              lHrefEnd;
            
            for (i = folders.length - 1; i > 0; i--) {
                var lUrl        = folders[i],
                    lSlashIndex = lUrl.lastIndexOf('/') + 1;
                
                lShortName = Util.removeStr(lUrl, lUrl.substr(lUrl, lSlashIndex));
                
                if (i !== 1)
                    lHtmlPath += lHref  + FS        + lUrl  +
                        lTitle          + lUrl      + _l    +
                        lShortName      + lHrefEnd  + '/';
                else
                    lHtmlPath += lShortName + '/';
            }
            
            return lHtmlPath;
        }
        
        /**
         * Функция строит таблицу файлв из JSON-информации о файлах
         * @param pJSON           - информация о файлах 
         * @param pKeyBinded      - если клавиши назначены, выделяем верхний файл
         * [{path:'путь',size:'dir'},
         * {name:'имя',size:'размер',mode:'права доступа'}]
         */
        this.buildFromJSON          = function(pJSON, pTemplate, pPathTemplate, pLinkTemplate) {
            var lFile, i, n, type, link, target, size, owner, mode,
                linkResult,
                files           = pJSON.files,
                /* сохраняем путь каталога в котором мы сейчас находимся*/
                lPath           = pJSON.path,
                
                /* 
                 * Строим путь каталога в котором мы находимся
                 * со всеми подкаталогами
                 */
                lHtmlPath       = getDirPath(lPath),
                
                /* Убираем последний слэш
                 * с пути для кнопки обновить страницу
                 * если он есть
                 */
                lRefreshPath    = CloudFunc.rmLastSlash(lPath),
                
                lFileTable      = Util.render(pPathTemplate, {
                    link        : FS + lRefreshPath,
                    fullPath    : lPath,
                    path        : lHtmlPath
                }),
                
                lHeader         = Util.render(pTemplate, {
                    className   : 'fm-header',
                    type        : '',
                    name        : 'name',
                    size        : 'size',
                    owner       : 'owner',
                    mode        : 'mode'
                });
                
            lHeader             = Util.replaceStr(lHeader, 'li', 'div');
            lFileTable          += lHeader;
            
            /* сохраняем путь */
            CloudFunc.Path      = lPath;
            
            lFileTable          += '<ul class="files">';
            /* Если мы не в корне */
            if (lPath !== '/') {
                /* ссылка на верхний каталог*/
                var lDotDot, lLink;
                /* убираем последний слеш и каталог в котором мы сейчас находимся*/
                lDotDot = lPath.substr(lPath, lPath.lastIndexOf('/'));
                lDotDot = lDotDot.substr(lDotDot, lDotDot.lastIndexOf('/'));
                /* Если предыдущий каталог корневой */
                if (lDotDot === '')
                    lDotDot = '/';
                
                lLink = FS + lDotDot;
                
                linkResult  = Util.render(pLinkTemplate, {
                    link        : lLink,
                    name        : '..',
                    target      : ''
                });
                
                /* Сохраняем путь к каталогу верхнего уровня*/
                lFileTable += Util.render(pTemplate,{
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
                lFile   = files[i];
                type    = lFile.size === 'dir' ? 'directory' : 'text-file';
                link    = FS + lPath + lFile.name;
                target  = lFile.size === 'dir' ? '' : "_blank";
                size    = lFile.size === 'dir' ? '&lt;dir&gt;' : CloudFunc.getShortSize(lFile.size);
                owner   = lFile.owner ? lFile.owner : 'root';
                
                mode    = CloudFunc.getSymbolicPermissions(lFile.mode);
                
                linkResult  = Util.render(pLinkTemplate, {
                    link        : link,
                    name        : lFile.name,
                    target      : target
                });
                
                
                lFileTable += Util.render(pTemplate,{
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
            
            lFileTable          += '</ul>';
            
            return lFileTable;
        };
     }
})(this, Util);
