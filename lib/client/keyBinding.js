var CloudCommander;
var CloudFunc;
CloudCommander.keyBinding=(function(){
    "use strict";
    
    var getByClass  = function(pClass){
        return document.getElementsByClassName(pClass);
    };
    
    var getById     = function(pId){
        return document.getElementById(pId);
    };
    
    var key_event=function(event){            
            var lCurrentFile;
            var lName, lTop;
            /* если клавиши можно обрабатывать*/
            if(CloudCommander.keyBinded){
                /* если нажали таб:
                 * переносим курсор на
                 * правую панель, если
                 * мы были на левой и
                 * наоборот
                 */
                if(event.keyCode===9){
                    console.log('Tab pressed');
                    try{
                        lCurrentFile=getByClass(CloudCommander.CURRENT_FILE)[0];
                    }catch(error){console.log(error);}
                }                
                /* if f3 pressed */
                 else   if(event.keyCode===114){
                     if (typeof CloudCommander.Viewer === 'function'){
                        CloudCommander.Viewer();                        
                     }
                 }
                /* навигация по таблице файлов*/
                /* если нажали клавишу вверх*/
                else if(event.keyCode===38){
                    /* получаем выдленный файл*/
                    lCurrentFile=getByClass(CloudCommander.CURRENT_FILE);
                    /* если ненайдены выделенные файлы - выходим*/
                    if(lCurrentFile.length===0)return;
                    lCurrentFile=lCurrentFile[0];
                    /* если это строка существет и
                     * если она не заголовок
                     * файловой таблицы
                     */
                    if(lCurrentFile.previousSibling && 
                       lCurrentFile.previousSibling.className!=='fm_header' ){
                        /* убираем выделение с текущего элемента */
                        lCurrentFile.className='';
                        /* и выделяем предыдущую строку*/
                        lCurrentFile.previousSibling.className = CloudCommander.CURRENT_FILE;
                        
                        /* if we on the top of
                         * the screan then 
                         * moving down the scroolbar
                         */
                        lTop = lCurrentFile.previousSibling.offsetTop;
                        lTop % 
                            (CloudCommander.HEIGHT - 
                                CloudCommander.HEIGHT/10) < 70 &&
                            lCurrentFile.parentElement.scrollByLines(-2);                        
                    }
                }
                /* если нажали клавишу в низ*/
                else if(event.keyCode===40){
                    /* получаем выдленный файл*/
                    lCurrentFile=getByClass(CloudCommander.CURRENT_FILE);                
                    /* если ненайдены выделенные файлы - выходим*/
                    if(lCurrentFile.length===0)return;
                    lCurrentFile=lCurrentFile[0];
                    /* если это не последняя строка */
                    if(lCurrentFile.nextSibling){
                        /* убираем с него выделение */
                        lCurrentFile.className='';
                        /* выделяем следующую строку*/
                        lCurrentFile.nextSibling.className = CloudCommander.CURRENT_FILE;
                        
                        /* if we on the bottom of
                         * the screan then 
                         * moving down the scroolbar
                         */
                        lTop = lCurrentFile.previousSibling.offsetTop;
                        var lHeight = CloudCommander.HEIGHT;
                        var lMod    = lTop % (lHeight - lHeight/10) < 70;
                        lTop > (lHeight/10) &&
                                 lMod < 70 && lMod > 50 &&
                            console.log(lCurrentFile
                                .parentElement
                                    .scrollByLines(2) || '!');                        
                    }
                }
                /* если нажали клавишу page up или Home
                 * переходим к самому верхнему
                 * элементу
                 */
                else if(/*event.keyCode===33 ||*/ event.keyCode===36){
                        lCurrentFile=getByClass(CloudCommander.CURRENT_FILE)[0];
                        /* убираем выделение с текущего файла*/
                        lCurrentFile.className='';
                        /* получаем первый элемент*/
                        lCurrentFile.parentElement.firstElementChild
                        /* пропускаем путь и заголовки столбиков*/
                            .nextElementSibling.nextElementSibling
                            /* выделяем верхий файл */
                            .className=CloudCommander.CURRENT_FILE;
                }
                /* если нажали клавишу page down или End
                 * выделяем последний элемент
                 */
                else if(/*event.keyCode===34 ||*/ event.keyCode===35){
                        lCurrentFile=getByClass(CloudCommander.CURRENT_FILE)[0];
                        /* снимаем выделение с текущего файла*/
                        lCurrentFile.className='';
                        /* выделяем самый нижний файл */
                        lCurrentFile.parentElement.lastElementChild.className=CloudCommander.CURRENT_FILE;
                }
                /* если нажали Enter - открываем папку*/
                else if(event.keyCode===13){
                    lCurrentFile=getByClass(CloudCommander.CURRENT_FILE);
                    /* если ненайдены выделенные файлы - выходим*/
                    if(!lCurrentFile.length)return;
                    lCurrentFile=lCurrentFile[0];
                    /* из него достаём спан с именем файла*/
                    lName=lCurrentFile.getElementsByClassName('name');
                    /* если нету (что вряд ли) - выходим*/
                    if(!lName)return false;
                    /* достаём все ссылки*/
                    var lATag=lName[0].getElementsByTagName('a');
                    /* если нету - выходим */
                    if(!lATag)return false;
                    
                    /* вызываем ajaxload привязанный через changelinks
                     * пробулем нажать на ссылку, если не получиться
                     * (opera, ie), вызываем событие onclick,
                     * которое пока не прописано у файлов
                     */
                     
                     if(lCurrentFile.onclick)lCurrentFile.onclick(true);
                     else try{
                         lATag[0].click();                                                
                     }
                     catch(error){
                         console.log(error);
                     }
                }
                /* если нажали <ctr>+r
                 * обновляем страницу,
                 * загружаем содержимое каталога
                 * при этом данные берём всегда с
                 * сервера, а не из кэша
                 * (обновляем кэш)
                 */
                else if(event.keyCode===82 &&
                    event.ctrlKey){
                    console.log('<ctrl>+r pressed');
                    console.log('reloading page...');
                    console.log('press <alt>+q to remove all key-handlers');                                    
                    /* Программно нажимаем на кнопку перезагрузки 
                     * содержимого каталога
                     */
                    var lRefreshIcon=getByClass(CloudFunc.REFRESHICON);
                    if(lRefreshIcon)lRefreshIcon=lRefreshIcon[0];
                    if(lRefreshIcon){
                        /* находим файл который сейчас выделен */
                         lCurrentFile=getByClass(CloudCommander.CURRENT_FILE);
                         if(lCurrentFile.length>0)lCurrentFile=lCurrentFile[0];
                         /* получаем название файла*/
                         var lSelectedName=lCurrentFile.getElementsByTagName('a')[0].textContent;
                         /* если нашли элемент нажимаем него
                          * а если не можем - нажимаем на 
                          * ссылку, на которую повешен eventHandler
                          * onclick
                          */
                        if(lRefreshIcon.click)lRefreshIcon.parentElement.click();
                        else lRefreshIcon.parentElement.onclick();
                        
                        /* перебираем файлы левой панели
                         * в поисках подсвеченого файла
                         */
                        var lLeft=getById('left');
                        if(lLeft){
                            /* перебираем все файлы в панели */
                            var lLi=lLeft.getElementsByTagName('li');
                            lCurrentFile.className='';
                            /* начинаем с 2-ух, по скольку
                             * 0 - это путь
                             * 1 - это заголовок файловой таблицы
                             */
                            for(var i=2;i<lLi.length;i++){
                                lName=lLi[i].getElementsByTagName('a')[0].textContent;
                                if(lSelectedName.length===lName.length &&
                                    !lSelectedName.indexOf(lName)){
                                        lLi[i].className=CloudCommander.CURRENT_FILE;
                                        break;
                                }
                            }                            
                        }                                    
                    }
                }
                /* если нажали <ctrl>+d чистим кэш */
                else if(event.keyCode===68 &&
                    event.ctrlKey){
                        console.log('<ctrl>+d pressed');
                        console.log('clearing cache...');
                        console.log('press <alt>+q to remove all key-handlers');
    
                        var lClearCache=getById('clear-cache');
                        if(lClearCache && lClearCache.onclick)lClearCache.onclick();                        
                }
                /* если нажали <alt>+q 
                 * убираем все обработчики
                 * нажатий клавиш
                 */             
                else if(event.keyCode===81 &&
                    event.altKey){
                        //document.removeEventListener('keydown', key_event,false);
                        console.log('<alt>+q pressed');
                        console.log('<ctrl>+r reload key-handerl - removed');
                        console.log('<ctrl>+s clear cache key-handler - removed');
                        console.log('press <alt>+s to to set them');
                        
                        /* обработчик нажатий клавиш снят*/
                        CloudCommander.keyBinded=false;
                }
            }
            /* если нажали <alt>+s 
             * устанавливаем все обработчики
             * нажатий клавиш
             */             
            else if(event.keyCode===83 &&
                event.altKey){
                    /*
                        document.addEventListener('keydown', key_event,false);
                    */
                    /* обрабатываем нажатия на клавиши*/
                    CloudCommander.keyBinded=true;
                    
                    console.log('<alt>+s pressed');
                    console.log('<ctrl>+r reload key-handerl - set');
                    console.log('<ctrl>+s clear cache key-handler - set');
                    console.log('press <alt>+q to remove them');
            }
        
        event.preventDefault();//запрет на дальнейшее действие
        
        return false;
    };
    /* добавляем обработчик клавишь */
    if(document.addEventListener)
        document.addEventListener('keydown', key_event,false);
    else document.onkeypress=key_event;
    /* клавиши назначены*/
    CloudCommander.keyBinded=true;
});