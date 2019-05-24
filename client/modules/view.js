'use strict';

/* global CloudCmd, DOM */

require('../../css/view.css');

const itype = require('itype/legacy');
const rendy = require('rendy/legacy');
const exec = require('execon');
const currify = require('currify/legacy');
const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');

const modal = require('@cloudcmd/modal');
const createElement = require('@cloudcmd/create-element');

const {time} = require('../../common/util');
const {FS} = require('../../common/cloudfunc');

const Files = require('../dom/files');
const Events = require('../dom/events');
const load = require('load.js');
const Images = require('../dom/images');

const {encode} = require('../../common/entity');

const {isArray} = Array;
const testRegExp = currify((name, reg) => reg.test(name));
const lifo = currify((fn, el, cb, name) => fn(name, el, cb));

const addEvent = lifo(Events.add);
const getRegExp = (ext) => RegExp(`\\.${ext}$`, 'i');

const loadCSS = promisify(load.css);

module.exports.show = show;
module.exports.hide = hide;

let Loading = false;

const Name = 'View';
CloudCmd[Name] = module.exports;

const Info = DOM.CurrentInfo;
const {Key} = CloudCmd;
const basename = (a) => a.split('/').pop();

let El;
let TemplateAudio;
let Overlay;

const Config = {
    beforeShow: (callback) => {
        Images.hide();
        Key.unsetBind();
        exec(callback);
    },
    beforeClose: (callback) => {
        Events.rmKey(listener);
        Key.setBind();
        exec(callback);
    },
    afterShow: (callback) => {
        El.focus();
        exec(callback);
    },
    onOverlayClick,
    afterClose      : exec,
    autoSize        : false,
    helpers: {
        title: {},
    },
};

module.exports.init = async () => {
    await loadAll();
    
    const events = [
        'click',
        'contextmenu',
    ];
    
    events.forEach(addEvent(Overlay, onOverlayClick));
};

async function show(data, options) {
    const prefixURL = CloudCmd.prefixURL + FS;
    
    if (Loading)
        return;
    
    if (!options || options.bindKeys !== false)
        Events.addKey(listener);
    
    El = createElement('div', {
        className: 'view',
        notAppend: true,
    });
    
    El.tabIndex = 0;
    
    if (data) {
        if (isArray(data))
            El.append(...data);
        else
            El.append(data);
        
        modal.open(El, initConfig(Config, options));
        return;
    }
    
    Images.show.load();
    
    const path = prefixURL + Info.path;
    const type = getType(path);
    
    switch(type) {
    default:
        return viewFile();
    
    case 'image':
        return viewImage(prefixURL);
    
    case 'media':
        return viewMedia(path);
    }
}

async function viewMedia(path) {
    const [e, element] = await getMediaElement(path);
    
    if (e)
        return alert(e);
    
    const allConfig = {
        ...Config,
        ...{
            autoSize: true,
            afterShow: () => {
                element
                    .querySelector('audio, video')
                    .focus();
            },
        },
    };
    
    modal.open(element, allConfig);
}

function viewFile() {
    Info.getData((error, data) => {
        if (error)
            return Images.hide();
        
        const element = document.createTextNode(data);
        const options = {
            ...Config,
        };
        
        if (CloudCmd.config('showFileName'))
            options.title = Info.name;
        
        El.append(element);
        modal.open(El, options);
    });
}

function initConfig(Config, options) {
    const config = {
        ...Config,
    };
    
    if (!options)
        return config;
    
    const names = Object.keys(options);
    for (const name of names) {
        const isConfig = !!config[name];
        const item = options[name];
        const isFunc = itype.function(item);
        
        if (!isFunc || !isConfig) {
            config[name] = options[name];
            continue;
        }
        
        const func = config[name];
        config[name] = () => {
            exec.series([func, item]);
        };
    }
    
    return config;
}

function hide() {
    modal.close();
}

function viewImage(prefixURL) {
    const makeTitle = (path) => {
        return {
            href: prefixURL + path,
            title: encode(basename(path)),
        };
    };
    
    const names = Info.files
        .map(DOM.getCurrentPath)
        .filter(isImage);
    
    const titles = names
        .map(makeTitle);
    
    const index = names.indexOf(Info.path);
    const imageConfig = {
        index,
        autoSize    : true,
        arrows      : true,
        keys        : true,
        helpers     : {
            title   : {},
        },
    };
    
    const config = {
        ...Config,
        ...imageConfig,
    };
    
    modal.open(titles, config);
}

function isImage(name) {
    const images = [
        'jp(e|g|eg)',
        'gif',
        'png',
        'bmp',
        'webp',
        'svg',
        'ico',
    ];
    
    return images
        .map(getRegExp)
        .some(testRegExp(name));
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

async function getMediaElement(src) {
    check(src);
    
    const [error, template] = await tryToCatch(Files.get, 'view/media-tmpl');
    
    if (error)
        return [error];
    
    const {name} = Info;
    
    if (!TemplateAudio)
        TemplateAudio = template;
    
    const is = isAudio(name);
    const type = is ? 'audio' : 'video';
    
    const innerHTML = rendy(TemplateAudio, {
        src,
        type,
        name,
    });
    
    const element = createElement('div', {
        innerHTML,
    });
    
    return [null, element];
}

function check(src, callback) {
    if (typeof src !== 'string')
        throw Error('src should be a string!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function');
}

/**
 * function loads css and js of FancyBox
 * @callback   -  executes, when everything loaded
 */
async function loadAll() {
    const {prefix} = CloudCmd;
    
    time(Name + ' load');
    
    Loading = true;
    await loadCSS(`${prefix}/dist/view.css`);
    Loading = false;
}

function onOverlayClick(event) {
    const position = {
        x: event.clientX,
        y: event.clientY,
    };
    
    setCurrentByPosition(position);
}

function setCurrentByPosition(position) {
    const element = DOM.getCurrentByPosition(position);
    
    if (!element)
        return;
    
    const {
        files,
        filesPassive,
    } = Info;
    
    const isFiles = ~files.indexOf(element);
    const isFilesPassive = ~filesPassive.indexOf(element);
    
    if (!isFiles && !isFilesPassive)
        return;
    
    const isCurrent = DOM.isCurrentFile(element);
    
    if (isCurrent)
        return;
    
    DOM.setCurrentFile(element);
}

function listener({keyCode}) {
    if (keyCode === Key.ESC)
        hide();
}

