var CloudFunc, exports;

(function(){
    'use strict';
    
    /** 
     * Модуль, содержащий функции, которые
     * будут работать и на клиенте и на сервере  
     */
    
    CloudFunc = exports || {};
    
    /* Путь с которым мы сейчас работаем */
    CloudFunc.Path            = '';
    
    /* КОНСТАНТЫ (общие для клиента и сервера)*/
    
    /* название программы */
    CloudFunc.NAME            = 'Cloud Commander';
    
    /* если в ссылке будет эта строка - в браузере js отключен */
    CloudFunc.FS              = '/fs';
    
    /* название css-класа кнопки обновления файловой структуры*/
    CloudFunc.REFRESHICON     = 'refresh-icon';
    
    /* id панелей с файлами */
    CloudFunc.LEFTPANEL       = 'left';
    CloudFunc.RIGHTPANEL      = 'right';
    
    /* length of longest file name */
    CloudFunc.SHORTNAMELENGTH = 16;
    
    /**
     * Функция убирает последний слеш,
     * если он - последний символ строки
     */
    CloudFunc.removeLastSlash               = function(pPath){
        if(typeof pPath==='string')
            return (pPath.lastIndexOf('/') === pPath.length-1) ?
                pPath.substr(pPath, pPath.length-1):pPath;
        else return pPath;
    }; 
    
    /** Функция возвращает заголовок веб страницы
     * @pPath
     */
    CloudFunc.getTitle                      = function(pPath){
        if(!CloudFunc.Path)
            CloudFunc.Path = '/';
            
        return  CloudFunc.NAME + ' - ' + (pPath || CloudFunc.Path);
            
    };
    /**
     * Функция переводит права из цыфрового вида в символьный 
     * @param pPerm_s - строка с правами доступа
     * к файлу в 8-миричной системе
     */
    CloudFunc.convertPermissionsToSymbolic  = function(pPerm_s){
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
        if(!pPerm_s) return;
        
        /* тип файла */
        var lType = pPerm_s.charAt(0);
        
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
        pPerm_s = pPerm_s.length> 5 ?pPerm_s.substr(3) : pPerm_s.substr(2);        
        
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
        var lOwner = (pPerm_s[0]-0).toString(2),
            lGroup = (pPerm_s[1]-0).toString(2),
            lAll   = (pPerm_s[2]-0).toString(2),
        /*
            console.log(lOwner+' '+lGroup+' '+lAll);
        */
        /* переводим в символьную систему*/
            lPermissions = //lType+' '+
                         (lOwner[0]-0>0?'r':'-') +
                         (lOwner[1]-0>0?'w':'-') +
                         (lOwner[2]-0>0?'x':'-') +
                         ' '                     +
                         (lGroup[0]-0>0?'r':'-') +
                         (lGroup[1]-0>0?'w':'-') +
                         (lGroup[2]-0>0?'x':'-') +
                         ' '                     +
                         (lAll[0]-0>0?'r':'-')   +
                         (lAll[1]-0>0?'w':'-')   +
                         (lAll[2]-0>0?'x':'-');
        /*
            console.log(lPermissions);
        */
        return lPermissions;
    };
    
    /**
     * Функция конвертирует права доступа к файлам из символьного вида
     * в цыфровой
     */
    CloudFunc.convertPermissionsToNumberic  = function(pPerm_s){
        /* если передана правильная строка, конвертированная
         * функциец convertPermissionsToSymbolic
         */     
        if(!pPerm_s || pPerm_s.length!==11)return pPerm_s;
        
        var lOwner= (pPerm_s[0]  === 'r' ? 4 : 0) +
                    (pPerm_s[1]  === 'w' ? 2 : 0) +
                    (pPerm_s[2]  === 'x' ? 1 : 0),
                    
            lGroup= (pPerm_s[4]  === 'r' ? 4 : 0) +
                    (pPerm_s[5]  === 'w' ? 2 : 0) +
                    (pPerm_s[6]  === 'x' ? 1 : 0),
                    
            lAll  = (pPerm_s[8]  === 'r' ? 4 : 0) +
                    (pPerm_s[9]  === 'w' ? 2 : 0) +
                    (pPerm_s[10] === 'x' ? 1 : 0);
        
        /* добавляем 2 цыфры до 5 */
        return '00' + lOwner + lGroup + lAll;
    };
    /** Функция получает короткие размеры
     * конвертируя байт в килобайты, мегабойты,
     * гигайбайты и терабайты
     * @pSize - размер в байтах
     */
    CloudFunc.getShortedSize                = function(pSize){
        /* if pSize=0 - return it */
        if (pSize !== pSize-0) return pSize;
        
        /* Константы размеров, что используются
         * внутри функции
         */    
        var l1BMAX  = 1024;
        var l1KBMAX = 1048576;
        var l1MBMAX = 1073741824;
        var l1GBMAX = 1099511627776;
        var l1TBMAX = 1125899906842624;
        
        var lShorted;
        
        if      (pSize < l1BMAX)    lShorted = pSize + 'b';
        else if (pSize < l1KBMAX)   lShorted = (pSize/l1BMAX) .toFixed(2) + 'kb';
        else if (pSize < l1MBMAX)   lShorted = (pSize/l1KBMAX).toFixed(2) + 'mb';
        else if (pSize < l1GBMAX)   lShorted = (pSize/l1MBMAX).toFixed(2) + 'gb';
        else if (pSize < l1TBMAX)   lShorted = (pSize/l1GBMAX).toFixed(2) + 'tb';
        
        return lShorted;
    };
        
    /** Функция парсит uid и имена пользователей
     * из переданного в строке вычитаного файла /etc/passwd
     * и возвращает массив обьектов имён и uid пользователей
     * @pPasswd_s - строка, в которой находиться файл /etc/passwd
     */
    CloudFunc.getUserUIDsAndNames           = function(pPasswd_s){
        var lUsers      = {name:'', uid:''},
            lUsersData  = [],
            i           = 0;
        do{
            /* получаем первую строку */        
            var lLine = pPasswd_s.substr(pPasswd_s, pPasswd_s.indexOf('\n') + 1);
            
            if(lLine){
            
            /* удаляем первую строку из /etc/passwd*/
            pPasswd_s = pPasswd_s.replace(lLine, '');
            
            /* получаем первое слово строки */
            var lName = lLine.substr(lLine,lLine.indexOf(':'));
            lLine = lLine.replace(lName+':x:','');
            
            /* получаем uid*/
            var lUID = lLine.substr(lLine,lLine.indexOf(':'));
            if((lUID - 0).toString()!=='NaN'){
                lUsers.name = lName;
                lUsers.uid = lUID;
                lUsersData[i++] = lUsers;
                console.log('uid='+lUID+' name='+lName);
            }
            }
        }while(pPasswd_s !== '');
        
        return lUsersData;
    };
    
    /** Функция получает адреса каждого каталога в пути
     * возвращаеться массив каталогов
     * @param url -  адрес каталога
     */
    CloudFunc._getDirPath                   = function(url){
        var folders     = [],
            i           = 0;
        do{
            folders[i++] = url;
            url = url.substr(url,url.lastIndexOf('/'));
        }while(url !== '');
                
        /* Формируем ссылки на каждый каталог в пути */
        var lHref       = '<a class=links href="',
            lTitle      = '" title="',
            _l          = '">',
            lHrefEnd    ='</a>',
            
            lHtmlPath,
            
            lFS_s   = CloudFunc.FS;
        /* корневой каталог */
        lHtmlPath = lHref   +
                    lFS_s   +
                    lTitle  +
                    '/'     +
                    _l      +
                    '/'     +
                    lHrefEnd;
        
        for(i = folders.length - 1; i > 0; i--)
        {
            var lUrl=folders[i],
                lShortName = lUrl.replace(lUrl.substr(lUrl,lUrl.lastIndexOf('/')+1),'');        
            if (i!==1)
                lHtmlPath += lHref + lFS_s  + lUrl +
                            lTitle + lUrl   + _l +
                            lShortName      + lHrefEnd + '/';
            else
                lHtmlPath+=lShortName+'/';
        }
        /* *** */
        return lHtmlPath;
    };
    
    /**
     * Функция формирует заголовки столбиков
     * @pFileTableTitles - массив названий столбиков
     */
    CloudFunc._getFileTableHeader           = function(pFileTableTitles)
    {
        var lHeader='<li class=fm-header>';
        lHeader+='<span class=mini-icon></span>';
        for(var i=0;i<pFileTableTitles.length;i++)
        {
            var lStr=pFileTableTitles[i];
            lHeader+='<span class='+lStr+'>'+
                        lStr+
                    '</span>';
        }
        lHeader += '</li>';
        
        return lHeader;
    };
    
    /**
     * Функция строит таблицу файлв из JSON-информации о файлах
     * @param pJSON           - информация о файлах 
     * @param pKeyBinded      - если клавиши назначены, выделяем верхний файл
     * [{path:'путь',size:'dir'},
     * {name:'имя',size:'размер',mode:'права доступа'}]
     */
    CloudFunc.buildFromJSON                 = function(pJSON, pSetCurrent)
    {
        var files = pJSON,
            /* сохраняем путь каталога в котором мы сейчас находимся*/
            lPath = files[0].path,
            
            /* 
             * Строим путь каталога в котором мы находимся
             * со всеми подкаталогами
             */
            lHtmlPath = CloudFunc._getDirPath(lPath),
            
            /* Убираем последний слэш
             * с пути для кнопки обновить страницу
             * если он есть
             */
            lRefreshPath = CloudFunc.removeLastSlash(lPath),
            lFS_s   = CloudFunc.FS,
            
            lFileTable = 
                '<li class=path>'+
                    '<span class="path-icon clear-cache"'                       +
                        'id=clear-cache '                                       +
                        'title="clear cache (Ctrl+D)">'                         +
                    '</span>'                                                   +
                    '<span class="path-icon ' + CloudFunc.REFRESHICON + '"'     +
                        ' title="refresh (Ctrl+R)">'                            +
                            '<a href="' + lFS_s + lRefreshPath + '">' +
                            '</a>'                                              +
                    '</span>'                                                   +
                    '<span>' + lHtmlPath + '</span>'                            +
                '</li>',
            
            fileTableTitles = ['name','size','owner','mode'];
        
        lFileTable          += CloudFunc._getFileTableHeader(fileTableTitles);
        
        /* сохраняем путь */
        CloudFunc.Path = lPath;
        
        /* Если мы не в корне */
        if(lPath !== '/'){
            /* ссылка на верхний каталог*/
            var lDotDot, lLink;
            /* убираем последний слеш и каталог в котором мы сейчас находимся*/
            lDotDot = lPath.substr(lPath, lPath.lastIndexOf('/'));
            lDotDot = lDotDot.substr(lDotDot, lDotDot.lastIndexOf('/'));
            /* Если предыдущий каталог корневой */
            if(lDotDot === '')
                lDotDot = '/';
            
            lLink = lFS_s + lDotDot;
            
            
            /* Сохраняем путь к каталогу верхнего уровня*/
            lFileTable += '<li draggable class>'                        +
                            '<span class="mini-icon directory"></span>' +
                            '<span class=name>'                         +
                                '<a href="' + lLink                     +
                                '" draggable=true>' + "..</a>"          +
                            '</span>'                                   +
                            '<span class=size>&lt;dir&gt;</span>'       +
                            '<span class=owner>.</span>'                +
                            '<span class=mode></span>'                  +
                        '</li>';
        }
        
        for(var i = 1, n = files.length; i < n; i++){
            lFileTable += '<li draggable class>';
            lFileTable += '<span draggable class="mini-icon ';
            
            /* если папка - выводим другую иконку */
            lFileTable += (files[i].size==='dir'?
                            'directory':'text-file')                    +
                            '">';
            lFileTable += '</span>';
            lFileTable += '<span draggable class=name>'                 +
                            '<a href="' + lFS_s + lPath + files[i].name +
                            '"'                                         +
                            /* открываем файлы */
                            /*в новой вкладке  */
                          (files[i].size === 'dir' ?
                            '' : ' target="_blank"')                    +
                            
                            ' title="' + files[i].name +'"'             +
                            ' draggable=true>' + files[i].name          +
                            "</a>"                                      +
                        '</span>';
            /* если папка - не выводим размер */
            lFileTable += '<span draggable class=size>'                 +
                            (files[i].size === 'dir' ?
                                '&lt;dir&gt;'
                                /* если это файл - получаем
                                 * короткий размер
                                 */
                                : CloudFunc.getShortedSize(
                                    files[i].size));
            lFileTable += '</span>'                                     +
                            '<span draggable class=owner>'              +
                            (!files[i].uid ? 'root' : files[i].uid)     +
                            '</span>'                                   +
                            '<span draggable class=mode>'               +
                            /* конвертируем названия разрешений
                             * из числового формата в буквенный
                             * при этом корневой каталог не трогаем
                             * по скольку в нём и так всё уже
                             * установлено еще на сервере
                             */
                            (//lPath==='/'?files[i].mode:
                            CloudFunc
                                .convertPermissionsToSymbolic
                                    (files[i].mode))                    +
                            '</span>';
            lFileTable += '</li>';
        }
        
        /* если клавиши назначены и
         * мы в корневом каталоге и
         * верхний файл еще не выделен -
         * выделяем верхний файл
         */
        if(pSetCurrent)
            lFileTable = lFileTable.replace('<li draggable class>', 
                '<li draggable class=current-file>');
            
        return lFileTable;
    };
})();