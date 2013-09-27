var Util, DOM, CloudCmd;

(function (Util, DOM) {
    'use strict';
    
     CloudCmd.Listeners = new ListenersProto(CloudCmd, Util, DOM);
     
     function ListenersProto(CloudCmd, Util, DOM){
        var Cache               = DOM.Cache,
            Events              = DOM.Events,
            getConfig           = CloudCmd.getConfig;
        
        this.analytics          = function() {
            getConfig(function(config) {
                if (config.analytics) {
                    Events.addOneTime('mousemove', function(){
                        var FIVE_SECONDS    = 5000,
                            lUrl            = CloudCmd.LIBDIRCLIENT + 'analytics.js';
                        
                        setTimeout(function(){
                            DOM.jsload(lUrl);
                        }, FIVE_SECONDS);
                    });
                }
            });
        };
        
        this.init = function () {
            appCache();
            contextMenu();
            dragndrop();
            unload();
            pop();
        };
        
        this.initKeysPanel          = function() {
            var i, lButton, lEl,
                lKeysPanel = {},
            
                lFuncs =[
                    null,
                    CloudCmd.Help,              /* f1 */
                    DOM.renameCurrent,          /* f2 */
                    CloudCmd.View,              /* f3 */
                    CloudCmd.Edit,              /* f4 */
                    DOM.copyCurrent,            /* f5 */
                    DOM.moveCurrent,            /* f6 */
                    DOM.promptNewDir,           /* f7 */
                    DOM.promptDeleteSelected,   /* f8 */
                    CloudCmd.Menu,              /* f9 */
                ];
            
            for (i = 1; i <= 9; i++) {
                lButton             = 'f' + i,
                lEl                 = DOM.getById('f' + i);
                lKeysPanel[lButton] = lEl;
                
                if (i === 1 || i === 3 || i === 4 || i === 9)
                    Events.addOneTime('click', lFuncs[i], lEl);
                else
                    Events.addClick(lFuncs[i], lEl);
            }
            
            lButton                 = '~',
            lEl                     = DOM.getById('~');
            lKeysPanel[lButton]     = lEl;
            Events.addOneTime('click', CloudCmd.Console, lEl);
            
            return lKeysPanel;
        };
        
        /**
         * функция меняет ссыки на ajax-овые 
         * @param pPanelID
         */
        this.changeLinks            = function(pPanelID){
            /* назначаем кнопку очистить кэш и показываем её */
            var lClearcache = DOM.getById('clear-cache');
                Events.addClick(Cache.clear, lClearcache);
                
            /* меняем ссылки на ajax-запросы */
            var lPanel  = DOM.getById(pPanelID),
                a       = DOM.getByTag('a', lPanel),
                
                /* right mouse click function varible */
                lOnContextMenu_f = function(pEvent){
                    var lReturn_b   = true,
                        Key         = CloudCmd.Key;
                    
                    Key && Key.unsetBind();
                    
                    /* getting html element
                     * currentTarget - DOM event
                     * target        - jquery event
                     */
                    var lTarget = pEvent.currentTarget || pEvent.target;
                    DOM.setCurrentFile(lTarget);
                    
                    if(Util.isFunction(CloudCmd.Menu) ){
                        CloudCmd.Menu({
                            x: pEvent.clientX,
                            y: pEvent.clientY
                        });
                        
                        /* disabling browsers menu*/
                        lReturn_b = false;
                        DOM.Images.showLoad();
                    }        
                    
                    return lReturn_b;
                },
                
            /* drag and drop function varible
             * download file from browser to descktop
             * in Chrome (HTML5)
             */
                lOnDragStart_f = function(pEvent){
                    var lElement    = pEvent.target,
                        lLink       = lElement.href,
                        lName       = lElement.textContent;
                    
                    /* if it's directory - adding json extension */
                    if( DOM.isCurrentIsDir() ){
                        lName       += '.json';
                        lLink       += '?json';
                    }
                    
                    pEvent.dataTransfer.setData("DownloadURL",
                        'application/octet-stream'  + ':' +
                        lName                       + ':' + 
                        lLink);
                },
                
                lSetCurrentFile_f = function(pEvent){
                    var pElement    = pEvent.target,
                        lTag        = pElement.tagName;
                    
                    if(lTag !== 'LI')
                        do{
                            pElement    = pElement.parentElement;
                            lTag        = pElement.tagName;
                        }while(lTag !== 'LI');
                    
                    DOM.setCurrentFile(pElement);
                },
                
                lUrl                = CloudCmd.HOST,
                lLoadDirOnce        = CloudCmd.loadDir();
            
            /* ставим загрузку гифа на клик*/
            Events.addClick( CloudCmd.refresh, a[0].parentElement );
            
            /* start from 1 cous 0 is a path and it's setted up */
            for(var i = 1, n = a.length; i < n ; i++){
                /* убираем адрес хоста*/
                var ai              = a[i],
                    lLink           = Util.removeStr(ai.href, lUrl),
                    lLoadDir        = CloudCmd.loadDir(lLink),
                    /* устанавливаем обработчики на строку
                     * на двойное нажатие на левую кнопку мышки */
                    lLi = ai.parentElement.parentElement;
                
                /* if we in path - set click event */
                if (lLi.className === 'path')
                    Events.addClick( lLoadDir, ai );
                else {
                    Events.add({
                        'click'         : DOM.preventDefault,
                        'mousedown'     : lSetCurrentFile_f,
                        'contextmenu'   : lOnContextMenu_f
                        }, lLi);
                    
                    Events.add('dragstart', lOnDragStart_f, ai);
                    
                    /* если ссылка на папку, а не файл */
                    if(ai.target !== '_blank'){
                        Events.add({
                            'dblclick' : lLoadDirOnce,
                            'touchend' : lLoadDirOnce
                            }, lLi);
                    }
                    
                    lLi.id = (ai.title ? ai.title : ai.textContent) +
                        '(' + pPanelID + ')';
                }
            }
        };
        
        function appCache() {
            getConfig(function(config) {
                var isAppCache  = config.appcache,
                    appCache    = window.applicationCache;
                
                if (isAppCache && appCache)
                    Events.add('updateready', function() {
                        var ret = confirm('An update is available. Reload now?');
                        
                        if (ret)
                            location.reload();
                    
                    }, appCache);
                });
        }
        
        function contextMenu() {
            Events.addContextMenu(function(pEvent){
                CloudCmd.Menu.ENABLED || DOM.preventDefault(pEvent);
            }, document);
        }
        
        function dragndrop() {
            var panels          = DOM.getByClass('panel'),
                i               = 0,
                n               = panels.length,
                preventDefault  = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                },
                toggle          = function () {
                    for (i = 0; i < n; i++)
                        DOM.toggleClass(panels[i], 'selected-panel');
                },
                onDrop          = function (event) {
                    var reader, file, files,
                         dir    = DOM.getCurrentDirPath(),
                         load   = function(file){
                            return function(event) {
                                var path    = dir + file.name,
                                    data    = event.target.result;
                                
                                DOM.RESTfull.save(path, data, CloudCmd.refresh);
                            };
                        };
                    
                    preventDefault(event);
                    toggle();
                    
                    files               = event.dataTransfer.files;
                    
                    if (files.length) {
                        n               = files.length;
                        
                        for (i = 0; i < n; i++) {
                            reader          = new FileReader();
                            file            = files[i];
                            Events.add('load', load(file), reader);
                            reader.readAsArrayBuffer(file);
                        }
                    }
                };
                
            Events.add(['dragenter', 'dragleave'], toggle);
            
            for (i = 0; i < n; i++) {
                Events.add('dragover', preventDefault, panels[i]);
                Events.add('drop', onDrop, panels[i]);
            }
        }
        
        function unload() {
            DOM.Events.add(['unload', 'beforeunload'], function (pEvent) {
                var lRet, 
                    Key     = CloudCmd.Key,
                    lIsBind = Key && Key.isBind();
                
                if(!lIsBind) {
                    DOM.preventDefault(pEvent);
                    lRet = 'Please make sure that you saved all work.';
                }
                
                return lRet;
            });
        }
        
        function pop() {
            Events.add("popstate", function(pEvent) {
                var lPath   = pEvent.state + '?json';
                
                if (pEvent.state) {
                    lPath   = pEvent.state + '?json';
                    ajaxLoad(lPath, {nohistory: true});
                } else
                    CloudCmd.route(location.hash);
                
                return true;
            });
        }
        
     }
    
})(Util, DOM);
