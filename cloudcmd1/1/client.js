/* Функция которая возвратит обьект CloudCommander
 * @window - обьект window
 * @document - обьект document
 * @CloudFunc - обьект содержащий общий функционал
 *              клиентский и серверный
 */
//var CloudCommander=(function(window,document){

//var document,window;

var CloudCommander=(function(){
"use strict";

/* если функции console.log нет - создаём заглушку */

/*
var console;
if(!window)window={console:{log:function(pParam){return pParam;}}};
else if(window && !window.console){
    console={
        'log':function(param){
            return param;
        }
    };
}else console=window.console;
*/
/*
    window.jQuery || document.write('<script src="jquery.min.js"><\/script>');
*/

/* Клиентский обьект, содержащий функциональную часть*/
var CloudClient={        
    /* Конструктор CloudClient, который
    * выполняет весь функционал по
    * инициализации
    */
    init                    :function(){},
    
    keyBinding              :function(){},/* функция нажатий обработки клавишь */
    keyBinded               :false,/* оброботка нажатий клавишь установлена*/
    _loadDir                 :function(){},
    /* 
     * Функция привязываеться ко всем ссылкам и
     *  загружает содержимое каталогов
     */
     /* Обьект для работы с кэшем */
     Cashe                  :{},
     
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
     LIBDIR                 :'/lib',
     LIBDIRCLIENT           :'/lib/client'
};

/* 
 * Обьект для работы с кэшем
 * в него будут включены функции для
 * работы с LocalStorage, webdb,
 * idexed db etc.
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
            CloudClient.jsload('https://raw.github.com/gist/350433/c9d3834ace63e5f5d7c8e1f6e3e2874d477cb9c1/gistfile1.js',
                function(){CloudClient.Cache._allowed=true;
            });
            */
        }
});
 /* если доступен localStorage и
  * в нём есть нужная нам директория -
  * записываем данные в него
  */
CloudClient.Cache.set=(function(pName, pData){
    if(CloudClient.Cache._allowed && pName && pData){
        localStorage.setItem(pName,pData);
    }
});
/* Если доступен Cache принимаем из него данные*/
CloudClient.Cache.get=(function(pName){
    if(CloudClient.Cache._allowed  && pName){
        return localStorage.getItem(pName);
    }
    else return null;
});
/* Функция очищает кэш*/
CloudClient.Cache.clear=(function(){
    if(CloudClient.Cache._allowed){
        localStorage.clear();
    }
});


/* функция обработки нажатий клавишь */
CloudClient.keyBinding=(function(){
    /* loading keyBinding module and start it */
    CloudClient.jsload(CloudClient.LIBDIRCLIENT+'/keyBinding.js',function(){
        CloudCommander.keyBinding();
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
            
            var lCurrentFile=document.getElementsByClassName(CloudClient.CURRENT_FILE);
            /* получаем имя каталога в котором находимся*/ 
            var lHref;
            try{
                lHref=lCurrentFile[0].parentElement.getElementsByClassName('path')[0].innerText;
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
            if(lA.length>0 && lA[0].innerText==='..' &&
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
            var lCurrentFile=document.getElementsByClassName(CloudClient.CURRENT_FILE);
            if(lCurrentFile && lCurrentFile.length > 0){
                /* если мы находимся не на 
                 * пути и не на заголовках
                 */
                if(this.className!=='path' && 
                    this.className!=='fm_header'){
                        
                    lCurrentFile[0].className='';
                    /* устанавливаем курсор на файл,
                    * на который нажали */
                    this.className=CloudClient.CURRENT_FILE;
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
    var lCurrentFile=document.getElementsByClassName(CloudClient.CURRENT_FILE);
    var lPanel;
    try{
        lPanel=lCurrentFile[0].parentElement.id;
    }catch(error){console.log("Current file not found\n"+error);}
    /* убираем слэш с имени каталога*/
    pDirName=pDirName.replace('/','');
    /* ищем файл с таким именем*/
    lPanel=document.getElementById(lPanel);
    if(!lPanel)return;
    
    var lLi=lPanel.getElementsByTagName('li');
    for(var i=0;i<lLi.length;i++){
        var lA=lLi[i].getElementsByTagName('a');
        if(lA.length && lA[0].innerText===pDirName){
            /* если уже выделен какой-то файл, снимаем
             * выделение
             */
            lCurrentFile=lPanel.getElementsByClassName(CloudClient.CURRENT_FILE);
            if(lCurrentFile.length>0)lCurrentFile[0].className='';
            
            lLi[i].className=CloudClient.CURRENT_FILE;
        }
    }
}); 
  
/* глобальные переменные */
var LoadingImage;
var ErrorImage;

var $;
var CloudFunc;
/* Конструктор CloudClient, который
 * выполняет весь функционал по
 * инициализации
 */
CloudClient.init=(function()
{    
    /* меняем title 
     * если js включен - имена папок отображать необязательно...
     * а может и обязательно при переходе, можно будет это сделать
     */
    var lTitle=document.getElementsByTagName('title');
    if(lTitle.length>0)lTitle[0].innerText='Cloud Commander';
    
    /* загружаем jquery: */
    CloudClient.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',function(){
        /* сохраняем переменную jQuery себе в область видимости */
        $=window.jQuery;
        if(!window.jQuery)CloudClient.jsload('jquery.min.js',
            function(){
               $=window.jQuery;
            });
    });
    
        /* загружаем общие функции для клиента и сервера*/
        CloudClient.jsload(CloudClient.LIBDIR+'/cloudfunc.js',function(){
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
        document.getElementsByClassName('path')[0].getElementsByTagName('a')[0].appendChild(LoadingImage);
        LoadingImage.className+=' hidden'; /* прячем её */
    }catch(error){console.log(error);}
    ErrorImage=CloudClient._images.error();      
    
    /* устанавливаем размер высоты таблицы файлов
     * исходя из размеров разрешения экрана
     */ 
     
    /* формируем и округляем высоту экрана
     * при разрешениии 1024x1280:
     * 658 -> 700
     */                            
    
    var lHeight=window.screen.height - (window.screen.height/3).toFixed();
    lHeight=(lHeight/100).toFixed()*100;
     
    var lFm=document.getElementById('fm');
    if(lFm)lFm.style.cssText='height:' +
        lHeight +
        'px';        
        
    /* выделяем строку с первым файлом */
    var lFmHeader=document.getElementsByClassName('fm_header');
    if(lFmHeader && lFmHeader[0].nextSibling)
        lFmHeader[0].nextSibling.className=CloudClient.CURRENT_FILE;
    
    /* показываем элементы, которые будут работать только, если есть js */
    var lFM=document.getElementById('fm');
    if(lFM)lFm.className='localstorage';
    
    /* если есть js - показываем правую панель*/
    var lRight=document.getElementById('right');
    if(lRight)lRight.className=lRight.className.replace('hidden','');
    
    CloudClient.cssSet({id:'show_2panels',
        element:document.head,
        inner:'#left{width:45%;}'
    });        
});

/* функция меняет ссыки на ajax-овые */
CloudClient._changeLinks = function(pPanelID)
{
    /* назначаем кнопку очистить кэш и показываем её*/
    var lClearcache=document.getElementById('clear-cache');
    if(lClearcache)lClearcache.onclick=CloudClient.Cache.clear;    
    
    /* меняем ссылки на ajax-запросы */
    var lPanel=document.getElementById(pPanelID);
    var a=lPanel.getElementsByTagName('a');
    
      /* Если нажмут на кнопку перезагрузить страниц - её нужно будет обязательно
     * перезагрузить
     */
    /* номер ссылки очистки кэша*/
    //var lCLEARICON=0;
    /* номер ссылки иконки обновления страницы */
    var lREFRESHICON=0;
        
     /* путь в ссылке, который говорит
      * что js отключен
      */
    var lNoJS_s = CloudFunc.NOJS; 
    var lFS_s   = CloudFunc.FS;
    
    for(var i=0;i<a.length;i++)
    {
        //if(i===2){/*ставим рамку на первый с верху файл*/
        //       a[i].parentElement.parentElement.className='current-file';
        //    }
        /* если ссылка на папку, а не файл */
        if(a[i].target!=='_blank')
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
            /* если мы попали на кнопку обновления структуры каталогов */
            /*
                if(a[i].className && a[i].className===CloudFunc.REFRESHICON)
            */
            /* устанавливаем обработчики на строку на одинарное и
             * двойное нажатие на левую кнопку мышки
             */
            else{
                try{
                    a[i].parentElement.parentElement.onclick=CloudClient._setCurrent();
                    a[i].parentElement.parentElement.ondblclick=CloudClient._loadDir(link);
                }catch(error){console.log(error);}
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
        var lPath=path;
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
            lPanel=document.getElementsByClassName(CloudClient.CURRENT_FILE)[0].parentElement.id;
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
                    console.log(textStatus+' : '+errorThrown);
                    var lLoading=document.getElementById('loading-image');
                    ErrorImage.className='icon error';
                    ErrorImage.title=errorThrown;
                    lLoading.parentElement.appendChild(ErrorImage);
                    lLoading.className='hidden';
                    //document.getElementsByClassName('path')[0].appendChild(ErrorImage);
                                        
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
                            ErrorImage.title=jqXHR.responseText.replace('Error: ENOENT, n','N');
                        }
                        /* если не хватает прав для чтения файла*/
                        else if(!jqXHR.responseText.indexOf('Error: EACCES,')){
                            ErrorImage.title=jqXHR.responseText.replace('Error: EACCES, p','P');
                        }
                            ErrorImage.className='icon error';                                
                            lLoading=document.getElementById('loading-image');
                            lLoading.parentElement.appendChild(ErrorImage);
                            lLoading.className='hidden';
                            
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
                    var lJSON_s=JSON.stringify(data);
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
    var lElem=document.getElementById(pElem);
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
 * Функция создаёт элемент и
 * загружает файл с src.
 * @pName       - название тэга
 * @pSrc        - путь к файлу
 * @pFunc       - функци
 * @pStyle      - стиль
 * @pId         - id
 * @pElement    - элемент, дочерним которо будет этот
 */
CloudClient._anyload = function(pName,pSrc,pFunc,pStyle,pId,pElement)
{     
    //если скрипт еще не загружен
    /* убираем путь к файлу, оставляя только название файла */
    var lID;
    if(pId===undefined){
        lID=pSrc.replace(pSrc.substr(pSrc,pSrc.lastIndexOf('/')+1),'');
        /* убираем точку*/
        lID=lID.replace('.','_');
    }else lID=pId;
    if(!document.getElementById(lID))
    {
        var element = document.createElement(pName);
        element.src = pSrc;
        element.id=lID;
        if(arguments.length>=3){
            element.onload=pFunc;
            if(arguments.length>=4){
                element.style.cssText=pStyle;
            }
        }        
        //document.body
        pElement.appendChild(element);    
        return element;//'elem '+src+' loaded';
    }
    /* если js-файл уже загружен 
     * запускаем функцию onload
     */
    else if(pFunc){
        try{
            pFunc();
        }catch(error){console.log(error);}
    }
};

/* Функция загружает js-файл */
CloudClient.jsload = function(pSrc,pFunc,pStyle,pId)
{
    CloudClient._anyload('script',pSrc,pFunc,pStyle,pId,document.body);
};
/* Функция создаёт елемент style и записывает туда стили 
 * @pParams_o - структура параметров, заполняеться таким
 * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
 * все параметры опциональны
 */
CloudClient.cssSet = function(pParams_o){
    var lElem=CloudClient._anyload('style',
        pParams_o.src,
        pParams_o.func,
        pParams_o.style,
        pParams_o.id,
        pParams_o.element?pParams_o.element:document.body);
    lElem.innerText=pParams_o.inner;
};

/* 
 * Функция генерирует JSON из html-таблицы файлов 
 */
/* 
 * Используеться при первом заходе в корень
 */
CloudClient._getJSONfromFileTable=function()
{
    var lLeft=document.getElementById('left');
    
    
    //var lPath=document.getElementById('path').innerText;
    var lPath=document.getElementsByClassName('path')[0].innerText;
    var lFileTable=[{path:lPath,size:'dir'}];
    var lLI=lLeft.getElementsByTagName('li');
    
    var j=1;/* счётчик реальных файлов */
    var i=1;/* счётчик элементов файлов в DOM */
    /* Если путь отличный от корневного
     * второй элемент li - это ссылка на верхний
     * каталог '..'
     */
    i=2;/* пропускам Path и Header*/

    
    for(;i<lLI.length;i++)
    {
        var lIsDir=lLI[i].getElementsByClassName('mini-icon')[0]
        .className.replace('mini-icon ','')==='directory'?true:false;
        
        var lName=lLI[i].getElementsByClassName('name')[0].innerText;
        /* если это папка - выводим слово dir вместо размера*/
        var lSize=lIsDir?'dir':lLI[i].getElementsByClassName('size')[0].innerText;
        var lMode=lLI[i].getElementsByClassName('mode')[0].innerText;
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
     CloudClient.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',function(){
        /* сохраняем переменную jQuery себе в область видимости */
        document.getElementsByClassName=function(pClassName){
            return $('.'+pClassName)[0];
        };
        $=window.jQuery;
        if(!window.jQuery)CloudClient.jsload('jquery.min.js',
            function(){
               $=window.jQuery;
               document.getElementsByClassName=function(pClassName){
                    return $('.'+pClassName)[0];
                };
            });
        });
}

return CloudClient;
})();//(this,this.document);
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