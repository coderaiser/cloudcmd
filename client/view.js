'use strict';

/* global CloudCmd, DOM, CloudFunc, $ */

const itype = require('itype/legacy');
const rendy = require('rendy');
const exec = require('execon');

const {time} = require('../common/util');
const Files = require('./files');
const Events = require('./events');

CloudCmd.View = ViewProto;

module.exports = exec.bind();

module.exports.show = show;
module.exports.hide = hide;

let Loading = false;

const Name = 'View';
const Info = DOM.CurrentInfo;
const Images = DOM.Images;
const Key = CloudCmd.Key;

let Element, TemplateAudio, Overlay;

const Config = {
    beforeShow: (callback) => {
        Images.hide();
        Key.unsetBind();
        showOverlay();
        exec(callback);
    },
    beforeClose: (callback) => {
        Key.setBind();
        exec(callback);
        hideOverlay();
    },
    afterShow: (callback) => {
        Element.focus();
        exec(callback);
    },
    afterClose      : exec,
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

function ViewProto(callback) {
    const func = callback || exec.with(show, null);
    
    Loading = true;
    
    exec.series([
        DOM.loadJquery,
        load,
        (callback) => {
            Loading = false;
            exec(callback);
        }
    ], func);
    
    Config.parent = Overlay = DOM.load({
        id          : 'js-view',
        name        : 'div',
        className   : 'fancybox-overlay fancybox-overlay-fixed'
    });
    
    ['click', 'contextmenu'].forEach((name) => {
        Events.add(name, Overlay, onOverLayClick);
    });
    
    Events.addKey(listener);
    
    return module.exports;
}

function show(data, options) {
    const prefixUrl = CloudCmd.PREFIX_URL + CloudFunc.FS;
    
    if (Loading)
        return;
    
    Element = $('<div class="view" tabindex=0>');
    
    let element;
    
    if (data) {
        element = $(Element).append(data);
        $.fancybox(element, initConfig(Config, options));
        return;
    }
    
    Images.show.load();
    
    const path = prefixUrl + Info.path;
    const type = getType(path);
    
    switch(type) {
    default:
        return Info.getData((error, data) => {
            if (error)
                return Images.hide();
            
            const element = document.createTextNode(data);
            /* add margin only for view text documents */
            Element.css('margin', '2%');
            
            $.fancybox(Element.append(element), Config);
        });
    
    case 'image':
        return showImage(path, prefixUrl);
    
    case 'media':
        return getMediaElement(path, (element) => {
            const media = DOM.getByDataName('js-media', element);
            const onKey = exec.with(onMediaKey, media);
            
            $.fancybox.open(element, {
                parent      : Overlay,
                beforeShow  : () => {
                    Config.beforeShow();
                    Events.addKey(onKey);
                },
                beforeClose : () => {
                    Config.beforeClose();
                    Events.rmKey(onKey);
                },
                afterShow: () => {
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
    }
}

function initConfig(Config, options) {
    const config = Object.assign({}, Config);
    
    if (!options)
        return config;
    
    Object.keys(options).forEach((name) => {
        const isConfig = !!config[name];
        const item = options[name];
        const isFunc = itype.function(item);
        
        if (!isFunc || !isConfig)
            return config[name] = options[name];
        
        const func = config[name];
        config[name] = () => {
            exec.series([func, item]);
        };
    });
    
    return config;
}

function hide() {
    $.fancybox.close();
}

function showImage(href, prefixUrl) {
    const title = Info.name;
    const names = Info.file
        .filter((file) => {
            const name = DOM.getCurrentName(file);
            return isImage(name);
        })
        .filter((file) => {
            const name = DOM.getCurrentName(file);
            return name !== title;
        }).map((file) => {
            const href = prefixUrl + DOM.getCurrentPath(file);
            const title = DOM.getCurrentName(file);
            
            return {
                href,
                title,
            };
        }).unshift({
            href,
            title,
        });
    
    const config = Object.assign({}, Config, {
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
    const images = [
        'jp(e|g|eg)',
        'gif',
        'png',
        'bmp',
        'webp',
        'svg',
        'ico'
    ];
    
    return images
        .map((ext) => RegExp(`\\.${ext}$`, 'i'))
        .some((reg) => reg.test(name));
}

function isMedia(name) {
    return isAudio(name) || isVideo(name);
}

function isAudio(name) {
    return /\.(mp3|ogg|m4a)$/i.test(name);
}

function isVideo(name) {
    return /\.(mp4|avi)$/i.test(name);
}

function getType(name) {
    if (isImage(name))
        return 'image';
    
    if (isMedia(name))
        return 'media';
}

function getMediaElement(src, callback) {
    check(src, callback);
    
    Files.get('view/media-tmpl', (error, template) => {
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
    time(Name + ' load');
    
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
    const files = Info.files;
    const filesPassive = Info.filesPassive;
    const {target} = event;
    const isOverlay = target === Overlay;
    const position = {
        x: event.clientX,
        y: event.clientY
    };
      
    if (!isOverlay)
        return;
    
    hideOverlay();
    
    const element = DOM.getCurrentByPosition(position);
    
    if (!element)
        return;
    
    const isFiles = ~files.indexOf(element);
    const isFilesPassive = ~filesPassive.indexOf(element);
    
    if (!isFiles && !isFilesPassive)
        return;
    
    const isCurrent = DOM.isCurrentFile(element);
    
    if (isCurrent)
        return;
    
    DOM.setCurrentFile(element);
    
    hide();
}

function hideOverlay() {
    Overlay.classList.remove('view-overlay');
}

function showOverlay() {
    Overlay.classList.add('view-overlay');
}

function listener({keyCode}) {
    if (keyCode === Key.ESC)
        hide();
}

