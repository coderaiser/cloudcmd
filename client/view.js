/* global itype */

var CloudCmd, Util, DOM, CloudFunc, $, exec;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    /* global rendy */
    
    CloudCmd.View = ViewProto;
    
    function ViewProto(CallBack) {
        var Name        = 'View',
            Loading     = false,
            Events      = DOM.Events,
            Info        = DOM.CurrentInfo,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            View        = exec.bind(Util),
            Element, TemplateAudio, Overlay,
            Config      = {
                beforeShow      : function(callback) {
                    Images.hide();
                    Key.unsetBind();
                    showOverlay();
                    exec(callback);
                },
                beforeClose     : function(callback) {
                    Key.setBind();
                    exec(callback);
                    hideOverlay();
                },
                afterShow       : function(callback) {
                    Element.focus();
                    exec(callback);
                },
                afterClose      : function(callback) {
                    exec(callback);
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
        
        View.show = show;
        View.hide = hide;
        
        function init() {
            var func = CallBack || exec.with(show, null);
            
            Loading = true;
            
            exec.series([
                DOM.loadJquery,
                load,
                function(callback) {
                    Loading = false;
                    exec(callback);
                }
            ], func);
            
            Config.parent = Overlay = DOM.load({
                id          : 'js-view',
                name        : 'div',
                className   : 'fancybox-overlay fancybox-overlay-fixed'
            });
            
            ['click', 'contextmenu'].forEach(function(name) {
                Events.add(name, Overlay, onOverLayClick);
            });
            
            Events.addKey(listener);
        }
        
        /**
         * function shows FancyBox
         */
        function show(data, options) {
            var path, element, type;
            var prefixUrl = CloudCmd.PREFIX_URL + CloudFunc.FS;
            
            if (Loading)
                return;
            
            Element = $('<div class="view" tabindex=0>');
            
            if (data) {
                element = $(Element).append(data);
                
                var config = initConfig(Config, options);
                
                $.fancybox(element, config);
            } else {
                Images.show.load();
                path = prefixUrl + Info.path;
                type = getType(path);
                
                switch(type) {
                default:
                    Info.getData(function(error, data) {
                        if (error)
                            return Images.hide();
                        
                        var element = document.createTextNode(data);
                        /* add margin only for view text documents */
                        Element.css('margin', '2%');
                        
                        $.fancybox(Element.append(element), Config);
                    });
                    break;
                
                case 'image':
                    showImage(path, prefixUrl);
                    break;
                
                case 'media':
                    getMediaElement(path, function(element) {
                        var media = DOM.getByDataName('js-media', element);
                        var onKey = exec.with(onMediaKey, media);
                            
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
                            afterShow: function() {
                                element
                                    .querySelector('audio, video')
                                    .focus();
                            },
                            helpers: {
                                overlay : null,
                                title   : null
                            }
                        });
                    });
                    break;
                }
            }
        }
        
        function initConfig(Config, options) {
            var config = {};
            
            Util.copyObj(config, Config);
            
            if (!options)
                return config;
            
            Object.keys(options).forEach(function(name) {
                var isConfig = !!config[name];
                var item = options[name];
                var isFunc = itype.function(item);
                
                if (!isFunc || !isConfig) {
                    config[name] = options[name];
                } else {
                    var func = config[name];
                    config[name] = function() {
                        exec.series([func, item]);
                    };
                }
            });
            
            return config;
        }
        
        function hide() {
            $.fancybox.close();
        }
        
        function showImage(path, prefixUrl) {
            var config,
                current     = Info.name,
                files       = [].slice.call(Info.files),
                names       = files
                    .filter(function(file) {
                        var name = DOM.getCurrentName(file);
                        return isImage(name);
                    })
                    .filter(function(file) {
                        var name = DOM.getCurrentName(file);
                        return name !== current;
                    }).map(function(file) {
                        var path = DOM.getCurrentPath(file),
                            name = DOM.getCurrentName(file);
                        
                        return {
                            href: prefixUrl + path,
                            title: name
                        };
                    });
            
            names.unshift({
                href: path,
                title: current
            });
            
            config = Util.copyObj({
            }, Config);
            
            config = Util.copyObj(config, {
                autoSize    : true,
                type        : 'image',
                prevEffect  : 'none',
                nextEffect  : 'none',
                arrows      : true,
                keys        : true,
                helpers     : {
                    overlay : null,
                    title   : {}
                }
            });
            
            $.fancybox.open(names, config);
        }
        
        function isImage(name) {
            var isMatch;
                
            isMatch = [
                'jp(e|g|eg)',
                'gif',
                'png',
                'bmp',
                'webp',
                'svg',
                'ico'
            ].some(function(ext) {
                var reg = RegExp('\\.' + ext + '$', 'i');
                return reg.test(name);
            });
            
            return isMatch;
        }
        
        function isMedia(name) {
            var isMatch;
            
            isMatch     = isAudio(name) || isVideo(name);
            
            return isMatch;
        }
        
        function isAudio(name) {
            return /\.(mp3|ogg|m4a)$/i.test(name);
        }
        
        function isVideo(name) {
            return /\.(mp4|avi)$/i.test(name);
        }
        
        function getType(name) {
            var type;
            
            if (isImage(name))
                type    = 'image';
            else if (isMedia(name))
                type    = 'media';
            
            return type;
        }
        
        function getMediaElement(src, callback) {
            check(src, callback);
            
            DOM.Files.get('view/media-tmpl', function(error, template) {
                var rendered, element, type, is,
                    name = Info.name;
                
                if (error) {
                    alert(error);
                } else {
                    if (!TemplateAudio)
                        TemplateAudio   = template;
                    
                    is      = isAudio(name);
                    type    =  is ? 'audio' : 'video';
                    
                    rendered    = rendy(TemplateAudio, {
                        src : src,
                        type: type,
                        name: Info.name
                    });
                    
                    element     = $(rendered)[0];
                    callback(element);
                }
            });
        }
        
        function check(src, callback) {
            if (typeof src !== 'string')
                throw Error('src should be a string!');
            
            if (typeof callback !== 'function')
                throw Error('callback should be a function');
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
            
            DOM.loadRemote('fancybox', function() {
                var prefix = CloudCmd.PREFIX;
                
                DOM.load.css(prefix + '/css/view.css', callback);
                
                DOM.load.style({
                    id      : 'view-inlince-css',
                    inner   : [
                        '.fancybox-title-float-wrap .child {',
                        '-webkit-border-radius: 0;',
                        '-moz-border-radius: 0;',
                        'border-radius: 0;',
                        '}'
                    ].join('')
                });
            });
        }
        
        function onOverLayClick(event) {
            var isCurrent, isFiles, isFilesPassive,
                files           = Info.files,
                filesPassive    = Info.filesPassive,
                element         = event.target,
                isOverlay       = element === Overlay,
                position        = {
                    x: event.clientX,
                    y: event.clientY
                };
              
            if (isOverlay) {
                hideOverlay();
                element     = DOM.getCurrentByPosition(position);
                
                if (element) {
                    isFiles         = ~files.indexOf(element);
                    isFilesPassive  = ~filesPassive.indexOf(element);
                    
                    if (isFiles || isFilesPassive) {
                        isCurrent = DOM.isCurrentFile(element);
                        
                        if (!isCurrent)
                            DOM.setCurrentFile(element);
                    }
                }
                
                View.hide();
            }
        }
        
        function hideOverlay() {
            Overlay.classList.remove('view-overlay');
        }
        
        function showOverlay() {
            Overlay.classList.add('view-overlay');
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
