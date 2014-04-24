var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.View = ViewProto;
        
    function ViewProto(CallBack) {
        var Name    = 'View',
            Loading = false,
            Events  = DOM.Events,
            Info    = DOM.CurrentInfo,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            View    = Util.exec.bind(Util),
            Element, TemplateAudio, Overlay,
            Config      = {
                beforeShow      : function() {
                    Images.hide();
                    Key.unsetBind();
                    DOM.show(Overlay);
                },
                beforeClose     : function() {
                    Key.setBind();
                    DOM.hide(Overlay);
                },
                fitToView       : true,
                loop            : false,
                openEffect      : 'none',
                closeEffect     : 'none',
                autoSize        : false,
                height          : '100%',
                width           : '100%',
                minWidth        : 0,
                minHeight       : 0,
                padding         : 0,
                preload         : 0,
                keys            : null,
                mouseWheel      : false,
                arrows          : false,
                helpers         : {
                    overlay : null,
                    title   : null
                }
            };
        
        View.show   = show;
        View.hide   = hide;
        
        function init() {
            var func = CallBack || Util.bind(show, null);
            
            Loading = true;
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                load,
                func
            ]);
            
            Config.parent = Overlay = DOM.anyload({
                id          : 'js-view',
                name        : 'div',
                className   : 'view-overlay fancybox-overlay fancybox-overlay-fixed'
            });
            
            Events.addClick(Util.bind(onOverLayClick, Overlay), Overlay);
            Events.addKey(listener);
        }
        
        /**
         * function shows FancyBox
         */
        function show(data, callback, newConfig) {
            var path, element, func, name,
                config = {};
            
            if (!Loading) {
                Element         = $('<div class="view" tabindex=0>');
                
                if (data) {
                    element    = $(Element).append(data);
                    func       = Util.retExec(callback);
                    
                    Config.afterShow = func;
                    
                    Util.copyObj(config, Config);
                    
                    for (name in newConfig)
                        config[name] = newConfig[name];
                    
                    $.fancybox(element, config);
                    
                } else {
                    Images.showLoad();
                    path   = CloudFunc.FS + Info.path;
                    
                    if (isImage(path)) {
                        config = Util.copyObj({
                            autoSize    : true
                        }, Config);
                        
                        $.fancybox.open(path, config);
                    } else if (isMusic(path))
                        getMusicElement(path, function(element) {
                            var audio       = element.querySelector('audio'),
                                onKey       = Util.bind(onMusicKey, audio);
                                
                            $.fancybox.open(element, {
                                parent      : Overlay,
                                beforeShow  : function() {
                                    Config.beforeShow();
                                    musicBeforeShow();
                                    Events.addKey(onKey);
                                },
                                beforeClose : function() {
                                    Config.beforeClose();
                                    Events.rmKey(onKey);
                                },
                                helpers: {
                                    overlay : null,
                                    title   : null
                                }
                            });
                        });
                    else
                        Info.getData(function(data) {
                            var element = document.createTextNode(data);
                            /* add margin only for view text documents */
                            Element.css('margin', '2%');
                            
                            $.fancybox(Element.append(element), Config);
                        });
                }
            }
        }
        
        function hide() {
            $.fancybox.close();
        }
        
        function isImage(name) {
            var isMatch = $.fancybox.isImage(name);
            
            return isMatch;
        }
        
        function isMusic(name) {
            var isMatch,
                isStr       = Util.isString(name),
                exts        = '.mp3|.mp4',
                extsReg     = new RegExp(exts);
            
            if (isStr)
                isMatch     = name.match(extsReg);
            
            return isMatch;
        }
        
        function getMusicElement(src, callback) {
            CloudCmd.getTemplate(TemplateAudio, 'view/audio', function(template) {
                var rendered, element;
                
                if (!TemplateAudio)
                    TemplateAudio   = template;
                
                rendered    = Util.render(TemplateAudio, {
                    src: src,
                    name: Info.name
                });
                
                element     = $(rendered)[0];
                Util.exec(callback, element);
            });
        }
        
        function onMusicKey(audio, event) {
            var key = event.keyCode;
            
            if (key === Key.SPACE) {
                if (audio.paused)
                    audio.play();
                else
                    audio.pause();
            }
        }
        
        function musicBeforeShow() {
            var audioDiv    = $('#js-audio'),
                audio       = audioDiv.find('audio'),
                width       = audio.width() +'px';
            
            audioDiv.width(width);
            
            Key.unsetBind();
        }
        
        /**
         * function loads css and js of FancyBox
         * @callback   -  executes, when everything loaded
         */
        function load(callback) {
            var dir         = CloudCmd.LIBDIRCLIENT + 'view/fancyBox/source/',
                js          = dir + 'jquery.fancybox.js',
                cssFiles    = [
                    dir + 'jquery.fancybox.css',
                    '/css/view.css'
                ],
                css         = CloudFunc.getJoinURL(cssFiles);
            
            Util.time(Name + ' load');
            
            DOM.anyLoadOnLoad([js, css], function() {
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(callback);
            });
        }
        
        function onOverLayClick(overlay) {
            var isCurrent, isFiles, isFilesPassive,
                files       = Util.slice(Info.files),
                filesPassive= Util.slice(Info.filesPassive),
                position    = CloudCmd.MousePosition,
                element     = document.elementFromPoint(position.x, position.y),
                isOverlay   = element === overlay;
              
            if (isOverlay) {
                DOM.hide(overlay);
                element     = DOM.getCurrentByPosition(position);
                
                if (element) {
                    isFiles         = files.indexOf(element) > 0;
                    isFilesPassive  = filesPassive.indexOf(element) > 0;
                    
                    if (isFiles || isFilesPassive) {
                        isCurrent = DOM.isCurrentFile(element);
                        
                        if (!isCurrent)
                            DOM.setCurrentFile(element);
                    }
                }
                
                View.hide();
            }
        }
        
        function listener(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                hide();
        }
        
        init();
        
        return View;
    }

})(CloudCmd, Util, DOM, CloudFunc);
