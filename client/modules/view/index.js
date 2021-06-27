'use strict';

/* global CloudCmd, DOM */

require('../../../css/view.css');

const rendy = require('rendy');
const currify = require('currify');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');
const load = require('load.js');

const modal = require('@cloudcmd/modal');
const createElement = require('@cloudcmd/create-element');

const {time} = require('../../../common/util');
const {FS} = require('../../../common/cloudfunc');
const {
    isImage,
    isAudio,
    getType,
} = require('./types');

const Files = require('../../dom/files');
const Events = require('../../dom/events');
const Images = require('../../dom/images');

const {encode} = require('../../../common/entity');

const {assign} = Object;
const {isArray} = Array;

const lifo = currify((fn, el, cb, name) => fn(name, el, cb));
const series = wraptile((...a) => {
    for (const f of a)
        f();
});

const isFn = (a) => typeof a === 'function';

const noop = () => {};
const addEvent = lifo(Events.add);

const loadCSS = load.css;

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
    beforeShow: () => {
        Images.hide();
        Key.unsetBind();
    },
    
    beforeClose: () => {
        Events.rmKey(listener);
        Key.setBind();
    },
    
    afterShow: () => {
        El.focus();
    },
    
    onOverlayClick,
    afterClose: noop,
    autoSize: false,
    
    helpers: {
        title: {},
    },
};
module.exports._Config = Config;

module.exports.init = async () => {
    await loadAll();
    
    const events = [
        'click',
        'contextmenu',
    ];
    
    events.forEach(addEvent(Overlay, onOverlayClick));
};

async function show(data, options = {}) {
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
        
        modal.open(El, initConfig(options));
        return;
    }
    
    Images.show.load();
    
    const path = prefixURL + Info.path;
    const type = options.raw ? '' : await getType(path);
    
    switch(type) {
    default:
        return await viewFile();
    
    case 'markdown':
        return await CloudCmd.Markdown.show(Info.path);
    
    case 'html':
        return viewHtml(path);
    
    case 'image':
        return viewImage(Info.path, prefixURL);
    
    case 'media':
        return await viewMedia(path);
    
    case 'pdf':
        return viewPDF(path);
    }
}

module.exports._createIframe = createIframe;
function createIframe(src) {
    const element = createElement('iframe', {
        src,
        width: '100%',
        height: '100%',
    });
    
    element.addEventListener('load', () => {
        element.contentWindow.addEventListener('keydown', listener);
    });
    
    return element;
}

module.exports._viewHtml = viewHtml;
function viewHtml(src) {
    modal.open(createIframe(src), Config);
}

function viewPDF(src) {
    const element = createIframe(src);
    
    const options = assign({}, Config);
    
    if (CloudCmd.config('showFileName'))
        options.title = Info.name;
    
    modal.open(element, options);
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

async function viewFile() {
    const [error, data] = await Info.getData();
    
    if (error)
        return Images.hide();
    
    const element = document.createTextNode(data);
    const options = Config;
    
    if (CloudCmd.config('showFileName'))
        options.title = Info.name;
    
    El.append(element);
    modal.open(El, options);
}

const copy = (a) => assign({}, a);

module.exports._initConfig = initConfig;
function initConfig(options) {
    const config = copy(Config);
    
    if (!options)
        return config;
    
    const names = Object.keys(options);
    for (const name of names) {
        const isConfig = Boolean(config[name]);
        const item = options[name];
        
        if (!isFn(item) || !isConfig) {
            config[name] = options[name];
            continue;
        }
        
        const fn = config[name];
        config[name] = series(fn, item);
    }
    
    return config;
}

function hide() {
    modal.close();
}

function viewImage(path, prefixURL) {
    const isSupportedImage = (a) => isImage(a) || a === path;
    const makeTitle = (path) => {
        return {
            href: `${prefixURL}${path}`,
            title: encode(basename(path)),
        };
    };
    
    const names = Info.files
        .map(DOM.getCurrentPath)
        .filter(isSupportedImage);
    
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

function check(src) {
    if (typeof src !== 'string')
        throw Error('src should be a string!');
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
    
    const isFiles = files.includes(element);
    const isFilesPassive = filesPassive.includes(element);
    
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

