import '#css/view.css';
import currify from 'currify';
import wraptile from 'wraptile';
import load from 'load.js';
import * as _modal from '@cloudcmd/modal';
import _createElement from '@cloudcmd/create-element';
import {time} from '#common/util';
import * as Events from '#dom/events';
import * as Images from '#dom/images';

const CloudCmd = globalThis.CloudCmd || {};
const DOM = globalThis.DOM || {};

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

let Loading = false;

const Name = 'View';

CloudCmd[Name] = {
    init,
    show,
    hide,
};

const Info = DOM.CurrentInfo;
const {Key} = CloudCmd;

let El;

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

export const _Config = Config;

export async function init() {
    await loadAll();
    
    const events = [
        'click',
        'contextmenu',
    ];
    
    events.forEach(addEvent(
        Overlay,
        onOverlayClick,
    ));
}

export async function show(data, options = {}) {
    if (Loading)
        return;
    
    if (!options || options.bindKeys !== false)
        Events.addKey(listener);
    
    El = _createElement('div', {
        className: 'view',
        notAppend: true,
    });
    
    El.tabIndex = 0;
    
    if (data) {
        if (isArray(data))
            El.append(...data);
        else
            El.append(data);
        
        _modal.open(El, initConfig(options));
        return;
    }
    
    Images.show.load();
    
    return await viewFile();
}

export const _createIframe = createIframe;

function createIframe(src, overrides = {}) {
    const {
        createElement = _createElement,
    } = overrides;
    
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

export const _viewHtml = viewHtml;

function viewHtml(src, overrides = {}) {
    const {modal = _modal} = overrides;
    modal.open(createIframe(src), Config);
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
    _modal.open(El, options);
}

const copy = (a) => assign({}, a);

export const _initConfig = initConfig;

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

export function hide() {
    _modal.close();
}

async function loadAll() {
    const {DIR_DIST} = CloudCmd;
    
    time(`${Name} load`);
    
    Loading = true;
    await loadCSS(`${DIR_DIST}/view.css`);
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
    
    const {files, filesPassive} = Info;
    
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
