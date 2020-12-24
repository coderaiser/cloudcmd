/* global CloudCmd */
/* global gritty */

import tryToCatch from 'try-to-catch';

import('../../css/terminal.css');

import exec from 'execon';
import load from 'load.js';
import DOM from '../dom/index.js';
import Images from '../dom/images.js';

const loadParallel = load.parallel;

const {Dialog} = DOM;
const {
    Key,
    config,
} = CloudCmd;

CloudCmd.Terminal = {
    init,
    show,
    hide,
};

let Loaded;
let Terminal;
let Socket;

const loadAll = async () => {
    const {prefix} = CloudCmd;
    
    const prefixGritty = getPrefix();
    const js = `${prefixGritty}/gritty.js`;
    const css = `${prefix}/dist/terminal.css`;
    
    const [e] = await tryToCatch(loadParallel, [js, css]);
    
    if (e) {
        const src = e.target.src.replace(window.location.href, '');
        return Dialog.alert(`file ${src} could not be loaded`);
    }
    
    Loaded = true;
};

export async function init() {
    if (!config('terminal'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await loadAll();
    await create();
}

export function hide() {
    CloudCmd.View.hide();
}

function getPrefix() {
    return CloudCmd.prefix + '/gritty';
}

function getPrefixSocket() {
    return CloudCmd.prefixSocket + '/gritty';
}

function getEnv() {
    return {
        ACTIVE_DIR: DOM.getCurrentDirPath,
        PASSIVE_DIR: DOM.getNotCurrentDirPath,
        CURRENT_NAME: DOM.getCurrentName,
        CURRENT_PATH: DOM.getCurrentPath,
    };
}

function create() {
    const options = {
        env: getEnv(),
        prefix: getPrefixSocket(),
        socketPath: CloudCmd.prefix,
        fontFamily: 'Droid Sans Mono',
    };
    
    const {socket, terminal} = gritty(document.body, options);
    
    Socket = socket;
    Terminal = terminal;
    
    Terminal.onKey(({domEvent}) => {
        const {keyCode, shiftKey} = domEvent;
        
        if (shiftKey && keyCode === Key.ESC) {
            hide();
        }
    });
    
    Socket.on('connect', exec.with(authCheck, socket));
}

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert('Wrong credentials!');
    });
}

export function show() {
    if (!Loaded)
        return;
    
    if (!config('terminal'))
        return;
    
    CloudCmd.View.show(Terminal.element, {
        afterShow: () => {
            Terminal.focus();
        },
    });
}

