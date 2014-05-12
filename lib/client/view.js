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
            var path, element, func,
                config = {};
            
            if (!Loading) {
                Element         = $('<div class="view" tabindex=0>');
                
                if (data) {
                    element    = $(Element).append(data);
                    func       = Util.retExec(callback);
                    
                    Config.afterShow = func;
                    
                    Util.copyObj(config, Config);
                    
                    if (newConfig)
                        Object.keys(newConfig).forEach(function(name) {
                            var func,
                                asyncCall       = Util.asyncCall,
                                item            = newConfig[name],
                                isFunc          = Util.isFunction(item);
                            
                            if (isFunc) {
                                func            = config[name];
                                config[name]    = Util.bind(asyncCall, [item, func]);
                            } else {
                                config[name]    = newConfig[name];
                            }
                        });
                    
                    $.fancybox(element, config);
                    
                } else {
                    Images.showLoad();
                    path   = CloudFunc.FS + Info.path;
                    
                    if (isImage(path)) {
                        config = Util.copyObj({
                            autoSize    : true
                        }, Config);
                        
                        $.fancybox.open(path, config);
                    } else if (isMedia(path))
                        getMediaElement(path, function(element) {
                            var media       = DOM.getByDataName('js-media', element),
                                onKey       = Util.bind(onMediaKey, media);
                                
                            $.fancybox.open(element, {
                                parent      : Overlay,
                                beforeShow  : function() {
                                    Config.beforeShow();
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
        
        function isMedia(name) {
            var isMatch;
            
            isMatch     = isAudio(name) || isVideo(name);
            
            return isMatch;
        }
        
        function isAudio(name) {
            var isMatch,
                isStr       = Util.isString(name),
                exts        = '.mp3|.ogg',
                extsReg     = new RegExp(exts);
            
            if (isStr)
                isMatch     = name.match(extsReg);
            
            return isMatch;
        }
        
        function isVideo(name) {
            var isMatch,
                isStr       = Util.isString(name),
                exts        = '.mp4|.avi',
                extsReg     = new RegExp(exts);
            
            if (isStr)
                isMatch     = name.match(extsReg);
            
            return isMatch;
        }
        
        function getMediaElement(src, callback) {
            CloudCmd.getTemplate(TemplateAudio, 'view/media', function(template) {
                var rendered, element, type, is,
                    name = Info.name;
                
                if (!TemplateAudio)
                    TemplateAudio   = template;
                
                is      = isAudio(name);
                type    =  is ? 'audio' : 'video';
                
                rendered    = Util.render(TemplateAudio, {
                    src : src,
                    type: type,
                    name: Info.name
                });
                
                element     = $(rendered)[0];
                Util.exec(callback, element);
            });
        }
        
        function onMediaKey(media, event) {
            var key = event.keyCode;
            
            if (key === Key.SPACE) {
                if (media.paused)
                    media.play();
                else
                    media.pause();
            }
        }
        
        /**
         * function loads css and js of FancyBox
         * @callback   -  executes, when everything loaded
         */
        function load(callback) {
            Util.time(Name + ' load');
            
            CloudCmd.getConfig(function(config) {
                var minify      = config.minify,
                    dir         = CloudCmd.LIBDIRCLIENT + 'view/fancyBox/source/',
                    jsFile      = dir + 'jquery.fancybox.js',
                    files       = [
                        dir + 'jquery.fancybox.css',
                        '/css/view.css'
                    ],
                    func        = function() {
                        Util.timeEnd(Name + ' load');
                        Loading = false;
                        Util.exec(callback);
                    };
                
                if (!minify)
                    files.push(jsFile);
                else
                    files       = [
                        jsFile,
                        CloudFunc.getJoinURL(files)
                    ];
                
                /*
                 * first thing first,
                 * if js would be loaded before css
                 * everything be wrong: view window don't shows up
                 *
                 * if join css that do not minified
                 * all images would not be loaded
                 */
                DOM.anyLoadOnLoad(files, func)
                    .cssSet({
                        id:'view-css',
                        inner : '#fancybox-loading {'   +
                                    'display: none'     +
                                '}'
                        });
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
