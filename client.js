/* Функция которая возвратит обьект CloudCommander
 * @window - обьект window
 * @document - обьект document
 * @CloudFunc - обьект содержащий общий функционал
 *              клиентский и серверный
 */

var CloudCommander=(function(){
"use strict";

/* Клиентский обьект, содержащий функциональную часть*/
var CloudClient={        
    /* Конструктор CloudClient, который
    * выполняет весь функционал по
    * инициализации
    */
    init                    :function(){},
    
    keyBinding              :function(){},/* функция нажатий обработки клавишь*/
    Editor                  :function(){},/* function loads and shows editor  */
    Viewer                  :function(){},/* function loads and shows viewer  */
    Terminal                :function(){},/* function loads and shows terminal*/
    keyBinded               :false,/* оброботка нажатий клавишь установлена   */
    _loadDir                :function(){},/* Функция привязываеться ко всем
                                           * ссылкам и
                                           *  загружает содержимое каталогов  */
     /* Обьект для работы с кэшем */
     Cache                  :{},
     /* Object contain additional system functional */
     Util                   :{},
     
     /* ПРИВАТНЫЕ ФУНКЦИИ */
     /* функция загружает json-данные о файловой системе */
     _ajaxLoad              :function(){},
     /* Функция генерирует JSON из html-таблицы файлов */
     _getJSONfromFileTable  :function(){},
     /* функция меняет ссыки на ajax-овые */
     _changeLinks           :function(){},     
     /* ОБЬЕКТЫ */
     /* обьект, который содержит функции для отображения картинок*/
     _images                :{},     
     /* КОНСТАНТЫ*/
     /* название css-класа текущего файла*/
     CURRENT_FILE           :'current-file',
     LIBDIR                 :'/lib/',
     LIBDIRCLIENT           :'/lib/client/',
     /* height of Cloud Commander
      * seting up in init()
      */
     HEIGHT                 :0
};

/* short names used all the time functions */
var getByClass  = function(pClass){
    return document.getElementsByClassName(pClass);
};

var getById     = function(pId){
    return document.getElementById(pId);
};

/* 
 * Обьект для работы с кэшем
 * в него будут включены функции для
 * работы с LocalStorage, webdb,
 * indexed db etc.
 */
CloudClient.Cache={
    _allowed     :true,     /* приватный переключатель возможности работы с кэшем */
     /* функция проверяет возможно ли работать с кэшем каким-либо образом */
    isAllowed   :function(){},
    /* Тип кэша, который доступен*/
    type        :{},
    /* Функция устанавливает кэш, если выбранный вид поддерживаеться браузером*/
    set         :function(){},
    /* Функция достаёт кэш, если выбранный вид поддерживаеться браузером*/
    get         :function(){},
    /* функция чистит весь кэш для всех каталогов*/
    clear       :function(){}
};

/* Обьект, который содержит
 * функции для отображения
 * картинок
 */
CloudClient._images={
    /* Функция создаёт картинку загрузки*/
    loading     :function(){   
        var e=document.createElement('span');
    e.className='icon loading';
    e.id='loading-image';
    return e;
},

    /* Функция создаёт картинку ошибки загрузки*/
    error       :function(){
        var e=document.createElement('span');    
        e.className='icon error';
        e.id='error-image';
        return e;
    }
};

/* функция проверяет поддерживаеться ли localStorage */
CloudClient.Cache.isAllowed=(function(){
    if(window.localStorage && 
        localStorage.setItem &&
        localStorage.getItem){
        CloudClient.Cache._allowed=true;
    }else
        {
            CloudClient.Cache._allowed=false;
            /* загружаем PolyFill для localStorage,
             * если он не поддерживаеться браузером
             * https://gist.github.com/350433 
             */
            /*
            Util.jsload('https://raw.github.com/gist/350433/c9d3834ace63e5f5d7c8e1f6e3e2874d477cb9c1/gistfile1.js',
                function(){CloudClient.Cache._allowed=true;
            });
            */
        }
});
 /* если доступен localStorage и
  * в нём есть нужная нам директория -
  * записываем данные в него
  */
CloudClient.Cache.set   = (function(pName, pData){
    if(CloudClient.Cache._allowed && pName && pData){
        localStorage.setItem(pName,pData);
    }
});
/* Если доступен Cache принимаем из него данные*/
CloudClient.Cache.get   = (function(pName){
    if(CloudClient.Cache._allowed  && pName){
        return localStorage.getItem(pName);
    }
    else return null;
});
/* Функция очищает кэш*/
CloudClient.Cache.clear = (function(){
    if(CloudClient.Cache._allowed){
        localStorage.clear();
    }
});

/* Object contain additional system functional */
CloudClient.Util        = (function(){
    /*
     * Function gets id by src
     * from http://domain.com/1.js to
     * 1_js
     */
    this.getIdBySrc  = function(pSrc){
        var lID=pSrc.replace(pSrc.substr(pSrc,
                    pSrc.lastIndexOf('/')+1),
                    '');
        /* убираем точку*/
        return lID.replace('.','_');
    },

    /* 
     * Функция создаёт элемент и
     * загружает файл с src.
     * @pName       - название тэга
     * @pSrc        - путь к файлу
     * @pFunc       - обьект, содержаий одну из функций
     *                  или сразу две onload и onerror
     *                  {onload: function(){}, onerror: function();}
     * @pStyle      - стиль
     * @pId         - id
     * @pElement    - элемент, дочерним которо будет этот
     * @pParams_o = {name: '', src: ' ',func: '', style: '', id: '', parent: '',
        async: false, inner: 'id{color:red}'}
     */
    this.anyload     = function(pParams_o){         
        /* убираем путь к файлу, оставляя только название файла */
        var lID = pParams_o.id;    
        var lSrc = pParams_o.src;
        var lFunc = pParams_o.func;
        var lAsync = pParams_o.async;
        
        if(!lID){        
            lID = this.getIdBySrc(lSrc);
        }
        var element = getById(lID);
        /* если скрипт еще не загружен */
        if(!element)
        {
            element = document.createElement(pParams_o.name);
            /* if working with external css
             * using href in any other case
             * using src
             */
            pParams_o.name === 'link' ? 
                  element.href = lSrc
                : element.src  = lSrc;
            element.id=lID;
            
    
            /* if passed arguments function
             * then it's onload by default
             */        
            if(pParams_o.func)
                if(typeof lFunc === 'function'){
                    element.onload = lFunc;
                /* if object - then onload or onerror */
                }else if (typeof lFunc === 'object') {
                    if(lFunc.onload &&
                        typeof lFunc.onload === 'function')
                            element.onload   = lFunc.onload;
                    
                    if(lFunc.onerror &&
                        typeof lFunc.onerror === 'function')
                                element.onerror = (function(){
                                    (pParams_o.element || document.body)
                                        .removeChild(element);
                                    
                                    lFunc.onerror();
                                });
                }
            
            if(pParams_o.style){
                element.style.cssText=pParams_o.style;
            }
                        
            if(lAsync || lAsync === undefined)
                element.async = true;
            
            (pParams_o.parent || document.body).appendChild(element);
            
            if(pParams_o.inner){
                element.innerHTML = pParams_o.inner;
            }
        }
        /* если js-файл уже загружен 
         * запускаем функцию onload
         */
        else if(lFunc && typeof lFunc==='function'){
            try{
                lFunc();
            }catch(error){console.log(error);}
        }
        return element;
    },

    /* Функция загружает js-файл */
    this.jsload      = function(pSrc, pFunc, pStyle, pId, pAsync, pInner){
        this.anyload({
            name : 'script',
            src  : pSrc,
            func : pFunc,
            stle : pStyle,
            id   : pId,
            async: pAsync,
            inner: pInner
        });
    },
    
    /* Функция создаёт елемент style и записывает туда стили 
 * @pParams_o - структура параметров, заполняеться таким
 * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
 * все параметры опциональны
 */
    this.cssSet      = function(pParams_o){
        pParams_o.name      = 'style';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return this.anyload(pParams_o);
            
    },
    /* Function loads external css files 
     * @pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */
    this.cssLoad     = function(pParams_o){
        pParams_o.name      = 'link';
        pParams_o.parent   = pParams_o.parent || document.head;
        var lElem           = this.anyload(pParams_o);
            
        lElem &&
            (lElem.rel = 'stylesheet');
        
        return lElem;
    };
    
    this.getById     = function(pId){return document.getElementById(pId);},
    
    this.getByClass  = function(pClass){
        return document.getElementsByClassName(pClass);
    },
    
    this.getPanel    = function(){
        var lCurrent = document.getElementsByClassName('current-file');
        lCurrent.length &&
            (lCurrent = lCurrent[0].parentElement);
        
        return lCurrent && lCurrent.id;
    }
    
});



/* функция обработки нажатий клавишь */
CloudClient.keyBinding=(function(){
    /* loading keyBinding module and start it */
    Util.jsload(CloudClient.LIBDIRCLIENT+'keyBinding.js',function(){
            CloudCommander.keyBinding();
    });
});

/* function loads and shows editor */
CloudClient.Editor = (function(){
    /* loading CloudMirror plagin */
    Util.jsload(CloudClient.LIBDIRCLIENT +
        'editor.js',{
            onload:(function(){
                CloudCommander.Editor.Keys();
            })
    });
});

/* function loads and shows viewer */
CloudClient.Viewer = (function(){
    Util.jsload(CloudClient.LIBDIRCLIENT + 
        'viewer.js',{
            onload: (function(){
                CloudCommander.Viewer.Keys();
            })
    });
});

/* function loads and shows terminal */
CloudClient.Terminal = (function(){
    Util.jsload(CloudClient.LIBDIRCLIENT + 
        'terminal.js',{
            onload: (function(){
                CloudCommander.Terminal.Keys();
            })
    });
});

/* 
 * Функция привязываеться ко всем ссылкам и
 *  загружает содержимое каталогов
 */
CloudClient._loadDir=(function(pLink,pNeedRefresh){
    /* @pElem - элемент, 
     * для которого нужно
     * выполнить загрузку
     */
        return function(){
            /* показываем гиф загрузки возле пути папки сверху*/
            LoadingImage.className='icon loading';/* показываем загрузку*/
            ErrorImage.className='icon error hidden';/* прячем ошибку */
            /* если элемент задан -
             * работаем с ним
             */
             /* если мы попали сюда с таблицы файлов*/
            try{
                this.firstChild.nextSibling.appendChild(LoadingImage);
            }catch(error){
                /* если <ctrl>+<r>
                 * кнопка обновления
                 */
                try{this.firstChild.parentElement.appendChild(LoadingImage);}
                catch(error){console.log(error);}
                }
            
            var lCurrentFile=getByClass(CloudClient.CURRENT_FILE);
            /* получаем имя каталога в котором находимся*/ 
            var lHref;
            try{
                lHref=lCurrentFile[0].parentElement.getElementsByClassName('path')[0].textContent;
            }catch(error){console.log('error');}
            
            lHref=CloudFunc.removeLastSlash(lHref);
            var lSubstr=lHref.substr(lHref,lHref.lastIndexOf('/'));
            lHref=lHref.replace(lSubstr+'/','');
                                     
            /* загружаем содержимое каталога*/
            CloudClient._ajaxLoad(pLink, pNeedRefresh);
            
            /* получаем все элементы выделенной папки*/
            /* при этом, если мы нажали обновить
             * или <Ctrl>+R - ссылок мы ненайдём
             * и заходить не будем
             */
            var lA=this.getElementsByTagName('a');
            /* если нажали на ссылку на верхний каталог*/
            if(lA.length>0 && lA[0].textContent==='..' &&
                lHref!=='/'){
            /* функция устанавливает курсор на каталог
             * с которого мы пришли, если мы поднялись
             * в верх по файловой структуре
             */
                CloudClient._currentToParent(lHref);
            }
            
            /* что бы не переходить по ссылкам
             * а грузить всё ajax'ом,
             * возвращаем false на событие
             * onclick
             */                         
            return false;
            };
    });
    

/*
 * Function edits file name
 *
 * @pParent - parent element
 * @pEvent
 */
CloudClient._editFileName = (function(pParent){
var lA = pParent.getElementsByTagName('a');
    if (lA.length && lA.textContent !== '..'){
            
            lA[0].contentEditable = true;
            CloudCommander.keyBinded = false;
            
            var lDocumentOnclick = document.onclick;
            
            /* setting event handler onclick
             * if user clicks somewhere keyBinded
             * backs
             */
            document.onclick = (function(){
                var lA = pParent.getElementsByTagName('a');
                if (lA.length && lA.textContent !== '..')
                    lA[0].contentEditable = false;
                
                CloudCommander.keyBinded = true;
                
                /* backs old document.onclick 
                 * and call it if it was
                 * setted up earlier
                 */
                document.onclick = lDocumentOnclick;
                if(typeof lDocumentOnclick === 'function')
                    lDocumentOnclick();
                
            });
    }
});

/* Функция устанавливает текущим файлом, тот
 * на который кликнули единожды
 */
CloudClient._setCurrent=(function(){
        /*
         * @pFromEnter - если мы сюда попали 
         * из события нажатия на энтер - 
         * вызоветься _loadDir
         */
        return function(pFromEnter){
            var lCurrentFile=getByClass(CloudClient.CURRENT_FILE);
            if(lCurrentFile && lCurrentFile.length > 0){
                /* если мы находимся не на 
                 * пути и не на заголовках
                 */
                if(this.className!=='path' && 
                    this.className!=='fm_header'){
                        
                    if (this.className === CloudClient.CURRENT_FILE &&
                        typeof pFromEnter !== 'boolean'){
                        var lParent = this;
                        
                        setTimeout(function(){
                            /* waiting a few seconds
                             * and if classes still equal
                             * make file name editable
                             * in other case
                             * double click event happend
                             */
                            if(lParent.className === CloudClient.CURRENT_FILE)
                                CloudClient._editFileName(lParent);
                            },400);
                    }
                    else{
                        lCurrentFile[0].className='';
                        /* устанавливаем курсор на файл,
                        * на который нажали */                                        
                        this.className = CloudClient.CURRENT_FILE;
                    }
                }
            }
             /* если мы попали сюда с энтера*/
             if(pFromEnter===true){
                this.ondblclick(this);               
             }/* если мы попали сюда от клика мышки */
             else{pFromEnter.returnValue=false;}
                                       
            /* что бы не переходить по ссылкам
             * а грузить всё ajax'ом,
             * возвращаем false на событие
             * onclick
             */
            return false;
        };
    });
    
/* функция устанавливает курсор на каталог
 * с которого мы пришли, если мы поднялись
 * в верх по файловой структуре
 * @pDirName - имя каталога с которого мы пришли
 */
CloudClient._currentToParent = (function(pDirName){                                              
    /* опредиляем в какой мы панели:
    * правой или левой
    */
    var lCurrentFile = getByClass(CloudClient.CURRENT_FILE);
    var lPanel       = lCurrentFile[0].parentElement;

    /* убираем слэш с имени каталога*/
    pDirName=pDirName.replace('/','');
    
    var lRootDir = getById(pDirName + '(' + lPanel.id + ')');
    
    /* if found li element with ID directory name
     * set it to current file
     */
    lRootDir &&
        !(lCurrentFile[0].className = '') &&
        (lRootDir.className = CloudClient.CURRENT_FILE);
}); 
  
/* глобальные переменные */
var LoadingImage;
var ErrorImage;

var CloudFunc, $, Util;
/* Конструктор CloudClient, который
 * выполняет весь функционал по
 * инициализации
 */
CloudClient.init=(function()
{    
    Util = new CloudClient.Util();
    
    /* меняем title 
     * если js включен - имена папок отображать необязательно...
     * а может и обязательно при переходе, можно будет это сделать
     */
    var lTitle=document.getElementsByTagName('title');
    if(lTitle.length>0)lTitle[0].textContent='Cloud Commander';
    
    /* загружаем jquery: */
    Util.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',{
        onload: function(){
            $ = window.jQuery;
        },
        
        onerror: function(){
            Util.jsload('lib/client/jquery.js');
            
            /*
             * if could not load jquery from google server
             * maybe we offline, load font from local
             * directory
             */
            Util.cssSet({id:'local-droids-font',
                element : document.head,
                inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                            'font-style: normal;font-weight: normal;'               +
                            'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                            ' url("font/DroidSansMono.woff") format("woff");}'
            });                   
        }
    });
    
        /* загружаем общие функции для клиента и сервера*/
        Util.jsload(CloudClient.LIBDIR+'cloudfunc.js',function(){
            /* берём из обьекта window общий с сервером функционал */
            CloudFunc=window.CloudFunc;
            
            /* меняем ссылки на ajax'овые*/
            CloudClient._changeLinks(CloudFunc.LEFTPANEL);
            CloudClient._changeLinks(CloudFunc.RIGHTPANEL);
                    
            /* устанавливаем переменную доступности кэша*/
            CloudClient.Cache.isAllowed();    
            /* Устанавливаем кэш корневого каталога */    
            if(!CloudClient.Cache.get('/'))CloudClient.Cache.set('/',CloudClient._getJSONfromFileTable());  
        }
    );                
    
    LoadingImage=CloudClient._images.loading();
    /* загружаем иконку загрузки возле кнопки обновления дерева каталогов*/        
    try{
        getByClass('path')[0]
            .getElementsByTagName('a')[0]
                .appendChild(LoadingImage);
                
        LoadingImage.className+=' hidden'; /* прячем её */
    }catch(error){console.log(error);}
    ErrorImage=CloudClient._images.error();      
    
    /* устанавливаем размер высоты таблицы файлов
     * исходя из размеров разрешения экрана
     */ 
                 
    /* выделяем строку с первым файлом */
    var lFmHeader=getByClass('fm_header');
    if(lFmHeader && lFmHeader[0].nextSibling)
        lFmHeader[0].nextSibling.className=CloudClient.CURRENT_FILE;
    
    /* показываем элементы, которые будут работать только, если есть js */
    var lFM = getById('fm');
    if(lFM)
        lFM.className='localstorage';
    
    /* если есть js - показываем правую панель*/
    var lRight=getById('right');
    if(lRight)lRight.className=lRight.className.replace('hidden','');
    
    /* формируем и округляем высоту экрана
     * при разрешениии 1024x1280:
     * 658 -> 700
     */                            
    
    var lHeight = 
        window.screen.height - 
        (window.screen.height/3).toFixed();
        
    lHeight=(lHeight/100).toFixed()*100;
     
    CloudClient.HEIGHT = lHeight;
     
    Util.cssSet({id:'show_2panels',
        element:document.head,
        inner:'#left{width:46%;}' +
            '.panel{height:' + lHeight +'px'
    });       
});

/* функция меняет ссыки на ajax-овые */
CloudClient._changeLinks = function(pPanelID)
{
    /* назначаем кнопку очистить кэш и показываем её*/
    var lClearcache=getById('clear-cache');
    if(lClearcache)lClearcache.onclick=CloudClient.Cache.clear;    
    
    /* меняем ссылки на ajax-запросы */
    var lPanel=getById(pPanelID);
    var a=lPanel.getElementsByTagName('a');
    
      /* Если нажмут на кнопку перезагрузить страниц - её нужно будет обязательно
     * перезагрузить
     */
    /* номер ссылки очистки кэша*/
    /* номер ссылки иконки обновления страницы */
    var lREFRESHICON=0;
        
     /* путь в ссылке, который говорит
      * что js отключен
      */
    var lNoJS_s = CloudFunc.NOJS; 
    var lFS_s   = CloudFunc.FS;
    
    for(var i=0;i<a.length;i++)
    {                
        /* если ссылка на папку, а не файл */
        if(a[i].target !== '_blank')
        {
            /* убираем адрес хоста*/
            var link='/'+a[i].href.replace(document.location.href,'');
            /* убираем значения, которые говорят,
             * об отсутствии js
             */
         
            if(link.indexOf(lNoJS_s)===lFS_s.length){
                link=link.replace(lNoJS_s,'');
            }            
            /* ставим загрузку гифа на клик*/
            if(i===lREFRESHICON)
                a[i].onclick=CloudClient._loadDir(link,true);            
            /* устанавливаем обработчики на строку на одинарное и
             * двойное нажатие на левую кнопку мышки
             */
            else{
                var lLi;
                
                try{
                    lLi = a[i].parentElement.parentElement;
                }catch(error){console.log(error);}
                
                /* if we in path changing onclick events*/
                if (lLi.className === 'path') {
                    a[i].onclick  = CloudClient._loadDir(link);                    
                }
                else {
                    lLi.onclick     = CloudClient._setCurrent();
                    lLi.ondblclick  = CloudClient._loadDir(link);
                    lLi.id = (a[i].title ? a[i].title : a[i].textContent) +
                        '(' + pPanelID + ')';
                }
            }
        }        
    }
};

/*
 * Функция загружает json-данные о Файловой Системе
 * через ajax-запрос.
 * @path - каталог для чтения
 * @pNeedRefresh - необходимость обновить данные о каталоге
 */
CloudClient._ajaxLoad=function(path, pNeedRefresh)
{                                   
        /* Отображаем красивые пути */
        /* added supporting of russian  language */
        var lPath=decodeURI(path);
        var lFS_s=CloudFunc.FS;
        if(lPath.indexOf(lFS_s)===0){
            lPath=lPath.replace(lFS_s,'');
            if(lPath==='')lPath='/';
        }
        console.log ('reading dir: "'+lPath+'";');
        
         /* если доступен localStorage и
         * в нём есть нужная нам директория -
         * читаем данные с него и
         * выходим
         * если стоит поле обязательной перезагрузки - 
         * перезагружаемся
         */
         
         /* опредиляем в какой мы панели:
          * правой или левой
          */
         var lPanel;
         try{
            lPanel=getByClass(CloudClient.CURRENT_FILE)[0].parentElement.id;
         }catch(error){console.log("Current file not found\n"+error);}
         
        if(pNeedRefresh===undefined && lPanel){
            var lJSON=CloudClient.Cache.get(lPath);
            if (lJSON!==null){
                /* переводим из текста в JSON */
                if(window && !window.JSON){
                    try{
                        lJSON=eval('('+lJSON+')');
                    }catch(err){
                        console.log(err);
                    }
                }else lJSON=JSON.parse(lJSON);
                CloudClient._createFileTable(lPanel,lJSON);
                CloudClient._changeLinks(lPanel);
                return;
            }
        }
        
        /* ######################## */
        try{
            $.ajax({
                url: path,
                error: function(jqXHR, textStatus, errorThrown){
                    ErrorImage.className='icon error';
                    ErrorImage.title = jqXHR.responseText;
                    
                    lLoading.parentElement.appendChild(ErrorImage);
                    
                    var lLoading        = getById('loading-image');                                                            
                    lLoading.className  ='hidden';
                    
                    console.log(jqXHR.responseText);                    
                },
                success:function(data, textStatus, jqXHR){                                            
                    /* если такой папки (или файла) нет
                     * прячем загрузку и показываем ошибку
                     */
                    /* для совместимости с firefox меняем data
                     * на jqXHR, он воспринимает data к Document
                     * когда возвращаеться ошибка, о том, что
                     * нет файла или нет доступа
                     */
                     
                     var lLoading;
                    if(!jqXHR.responseText.indexOf('Error:')){
                        /* если файла не существует*/
                        if(!jqXHR.responseText.indexOf('Error: ENOENT, ')){
                            ErrorImage.title = jqXHR.responseText.replace('Error: ENOENT, n','N');
                        }
                        /* если не хватает прав для чтения файла*/
                        else if(!jqXHR.responseText.indexOf('Error: EACCES,')){
                            ErrorImage.title = jqXHR.responseText.replace('Error: EACCES, p','P');
                        } else
                            ErrorImage.title        = jqXHR.responseText;
                            ErrorImage.className    ='icon error';                                
                            lLoading                = getById('loading-image');
                            lLoading.parentElement.appendChild(ErrorImage);
                            lLoading.className      = 'hidden';
                            
                            console.log(jqXHR.responseText);
                            
                            return;
                    }                        
                    CloudClient._createFileTable(lPanel,data);
                    CloudClient._changeLinks(lPanel);
                                                                
                    /* Сохраняем структуру каталогов в localStorage,
                     * если он поддерживаеться браузером
                     */
                    /* переводим таблицу файлов в строку, для
                    * сохранения в localStorage
                    */
                    var lJSON_s = JSON.stringify(data);
                    console.log(lJSON_s.length);
                    
                    /* если размер данных не очень бошьой
                    * сохраняем их в кэше
                    */
                    if(lJSON_s.length<50000)
                        CloudClient.Cache.set(lPath,lJSON_s);                        
                }
            });
        }catch(err){console.log(err);}
};

/*
 * Функция строит файловую таблицу
 * @pEleme - родительский элемент
 * @pJSON  - данные о файлах
 */
CloudClient._createFileTable = function(pElem,pJSON)
{    
    var lElem=getById(pElem);
    /* говорим построителю,
     * что бы он в нужный момент
     * выделил строку с первым файлом
     */
    
    /* очищаем панель */
    var i = lElem.childNodes.length;
    while(i--){
        lElem.removeChild(lElem.lastChild);
    }
    
    /* заполняем панель новыми элементами */    
    lElem.innerHTML=CloudFunc.buildFromJSON(pJSON,true);
};

/* 
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
CloudClient._getJSONfromFileTable=function()
{
    var lLeft=getById('left');    
    var lPath=getByClass('path')[0].textContent;
    var lFileTable=[{path:lPath,size:'dir'}];
    var lLI=lLeft.getElementsByTagName('li');
    
    var j=1;/* счётчик реальных файлов */
    var i=1;/* счётчик элементов файлов в DOM */
    /* Если путь отличный от корневного
     * второй элемент li - это ссылка на верхний
     * каталог '..'
     */
    i=2; /* пропускам Path и Header*/

    
    for(;i<lLI.length;i++)
    {
        var lIsDir=lLI[i].getElementsByClassName('mini-icon')[0]
        .className.replace('mini-icon ','')==='directory'?true:false;
        
        var lName=lLI[i].getElementsByClassName('name')[0];        
        lName &&
            (lName = lName.getElementsByTagName('a'));
        /* if found link to folder 
         * cheking is it a full name
         * or short
         */
         /* if short we got title 
         * if full - getting textConent
         */
        lName.length &&
            (lName = lName[0]);
        lName.title &&
            (lName = lName.title) ||
            (lName = lName.textContent);        
            
        /* если это папка - выводим слово dir вместо размера*/
        var lSize=lIsDir?'dir':lLI[i].getElementsByClassName('size')[0].textContent;
        var lMode=lLI[i].getElementsByClassName('mode')[0].textContent;
        /* переводим права доступа в цыфровой вид
         * для хранения в localStorage
         */
        lMode=CloudFunc.convertPermissionsToNumberic(lMode);
        
        lFileTable[j++]={
            name:lName,
            size:lSize,
            mode:lMode
        };
    }
    return JSON.stringify(lFileTable);
};


   /* если нет функции поиска по класам,
     * а её нет в IE,
     * - используем jquery
     * при необходимости
     * можна заменить на любой другой код
     */ 
 if(!document.getElementsByClassName){
     Util.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',{
         onload: function(){
            /* сохраняем переменную jQuery себе в область видимости */
            document.getElementsByClassName = function(pClassName){
                return window.jQuery('.'+pClassName)[0];
            };
         },
        onerror: function(){
            Util.jsload(CloudClient.LIBDIRCLIENT + 'jquery.js',
                function(){
                   getByClass=function(pClassName){
                        return window.jQuery('.'+pClassName)[0];
                    };
                });
        }
    });
}

return CloudClient;
})();

try{
    window.onload=function(){
        'use strict';        
        /* базовая инициализация*/
        CloudCommander.init();
        /* привязываем клавиши к функциям */
        CloudCommander.keyBinding();
    };
}
catch(err){}