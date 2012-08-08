var CloudCommander;
var CloudFunc;
CloudCommander.keyBinding=(function(){
    "use strict";
  
  var Util = new CloudCommander.Util();
      
    var lTabPanel   = {
        left        : 0,
        right       : 0
        
    };
    var key_event=function(event){            
            var lCurrentFile,
                lName, lTop, i;
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
                    
                    var lCURRENT_FILE = CloudCommander.CURRENT_FILE;
                    try{
                        lCurrentFile = Util.getCurrentFile();
                            
                        /* changing parent panel of curent-file */
                        var lPanel = Util.getPanel();
                        var lId = lPanel.id;
                        lTabPanel[lId] = lCurrentFile;
                        
                        lPanel = Util.getPanel({active:false});
                                                
                        if(lTabPanel[lId])
                            lTabPanel[lId].className = lCURRENT_FILE;                        
                        else
                            lPanel.getElementsByTagName('li')[2]
                                .className = lCURRENT_FILE;
                        
                        lCurrentFile.className = '';                        
                                                                                                
                    }catch(error){console.log(error);}                    
                }                
                /* if f2 pressed */
                else if(event.keyCode===113){
                    
                }
                /* if f3 pressed */
                else if(event.keyCode===114){                                        
                    if (typeof CloudCommander.Viewer === 'function')
                        CloudCommander.Viewer();                        
                }
                /* if alt+f3 pressed */
                else if(event.keyCode===114 &&
                    event.altKey){
                        if (typeof CloudCommander.Terminal === 'function')
                        CloudCommander.Terminal();                        
                }
                 /* if f4 pressed */ 
                else if(event.keyCode === 115) {
                    Util.Images.showLoad();
                    
                    if (typeof CloudCommander.Editor === 'function')
                        CloudCommander.Editor();
                 }
                /* навигация по таблице файлов*/
                /* если нажали клавишу вверх*/
                else if(event.keyCode===38){
                    /* получаем выдленный файл*/
                    lCurrentFile = Util.getCurrentFile();
                    
                    /* если ненайдены выделенные файлы - выходим*/
                    if(!lCurrentFile) return;
                    
                    /* если это строка существет и
                     * если она не заголовок
                     * файловой таблицы
                     */
                    if(lCurrentFile.previousSibling && 
                       lCurrentFile.previousSibling.className!=='fm_header' ){
                        /* убираем выделение с текущего элемента */
                        lCurrentFile.className='';
                        /* и выделяем предыдущую строку*/
                        lCurrentFile.previousSibling.className = 
                            CloudCommander.CURRENT_FILE;
                                                                        
                        /* scrolling to current file*/
                        if(lCurrentFile.previousSibling)
                            lCurrentFile.previousSibling
                                .scrollIntoViewIfNeeded();                      
                    }
                }
                /* если нажали клавишу в низ*/
                else if(event.keyCode===40){
                    /* получаем выдленный файл*/
                    lCurrentFile = Util.getCurrentFile();
                                            
                    /* если ненайдены выделенные файлы - выходим*/
                    if(!lCurrentFile)return;
                                                            
                    /* если это не последняя строка */
                    if(lCurrentFile.nextSibling){
                        
                        /* убираем с него выделение */
                        lCurrentFile.className='';
                        
                        /* выделяем следующую строку*/
                        lCurrentFile.nextSibling.className =
                            CloudCommander.CURRENT_FILE;
                        
                        /* scrolling to current file*/
                        lCurrentFile.nextSibling.scrollIntoViewIfNeeded();
                    }
                }
                /* если нажали клавишу Home
                 * переходим к самому верхнему
                 * элементу
                 */
                else if(event.keyCode === 36){
                        lCurrentFile = Util.getCurrentFile();
                        /* убираем выделение с текущего файла*/
                        lCurrentFile.className='';
                        /* получаем первый элемент*/
                        lCurrentFile.parentElement.firstElementChild
                        /* пропускаем путь и заголовки столбиков*/
                            .nextElementSibling.nextElementSibling
                            /* выделяем верхий файл */
                            .className=CloudCommander.CURRENT_FILE;
                        
                        /* move scrollbar to top */
                        Util.getPanel().scrollByLines(-100000000000000);
                }                
                /* если нажали клавишу End
                 * выделяем последний элемент
                 */
                else if( event.keyCode === 35){
                        lCurrentFile = Util.getCurrentFile();
                        /* снимаем выделение с текущего файла*/
                        lCurrentFile.className='';
                        /* выделяем самый нижний файл */
                        lCurrentFile.parentElement.lastElementChild
                            .className = CloudCommander.CURRENT_FILE;
                        
                        /* move scrollbar to bottom*/
                        Util.getPanel().scrollByLines(100000000000000);
                }
                /* если нажали клавишу page down
                 * проматываем экран
                 */
                else if(event.keyCode === 34){
                    Util.getPanel().scrollByPages(1);
                    
                    lCurrentFile = Util.getCurrentFile();
                    for(i=0; i<30; i++){
                        if(!lCurrentFile.nextSibling) break;
                        
                        lCurrentFile = lCurrentFile.nextSibling;
                    }
                    Util.getCurrentFile().className = '';
                    lCurrentFile.className = CloudCommander.CURRENT_FILE;
                }
                /* если нажали клавишу page up
                 * проматываем экран
                 */
                else if(event.keyCode === 33){
                     Util.getPanel().scrollByPages(-1);
                    
                    lCurrentFile = Util.getCurrentFile();
                    for(i=0; i<30; i++){
                        if(!lCurrentFile.previousSibling) break;
                        else try{
                            lCurrentFile
                                .previousSibling
                                    .previousSibling
                                        .previousSibling
                                            .previousSibling;
                            } catch(pError){break};
                        lCurrentFile = lCurrentFile.previousSibling;
                    }
                    Util.getCurrentFile().className = '';
                    lCurrentFile.className = CloudCommander.CURRENT_FILE;
                }
                /* если нажали Enter - открываем папку*/
                else if(event.keyCode === 13){
                    lCurrentFile = Util.getByClass(CloudCommander.CURRENT_FILE);
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
                    var lRefreshIcon                = Util
                        .getByClass(CloudFunc.REFRESHICON);
                        
                    if(lRefreshIcon)lRefreshIcon    = lRefreshIcon[0];
                    if(lRefreshIcon){
                        /* находим файл который сейчас выделен */
                         lCurrentFile       = Util
                            .getByClass(CloudCommander.CURRENT_FILE);
                         
                         if(lCurrentFile.length > 0)
                            lCurrentFile=lCurrentFile[0];
                         /* получаем название файла*/
                         var lSelectedName  = lCurrentFile
                            .getElementsByTagName('a')[0].textContent;
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
                        var lLeft = Util.getById('left');
                        if(lLeft)
                            CloudCommander._currentToParent(lSelectedName);
                        }
                    }
                /* если нажали <ctrl>+d чистим кэш */
                else if(event.keyCode===68 &&
                    event.ctrlKey){
                        console.log('<ctrl>+d pressed');
                        console.log('clearing cache...');
                        console.log('press <alt>+q to remove all key-handlers');
    
                        var lClearCache = Util.getById('clear-cache');
                        if(lClearCache && lClearCache.onclick)lClearCache.onclick();                        
                }
                /* если нажали <alt>+q 
                 * убираем все обработчики
                 * нажатий клавиш
                 */             
                else if(event.keyCode === 81 &&
                    event.altKey){
                        //document.removeEventListener('keydown', key_event,false);
                        console.log('<alt>+q pressed');
                        console.log('<ctrl>+r reload key-handerl - removed');
                        console.log('<ctrl>+s clear cache key-handler - removed');
                        console.log('press <alt>+s to to set them');
                        
                        /* обработчик нажатий клавиш снят*/
                        CloudCommander.keyBinded=false;
                }
                
                event.preventDefault();//запрет на дальнейшее действие
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
        
        return false;
    };
    /* добавляем обработчик клавишь */
    if(document.addEventListener)
        document.addEventListener('keydown', key_event,false);
    else document.onkeypress = key_event;
    /* клавиши назначены*/
    CloudCommander.keyBinded=true;
});