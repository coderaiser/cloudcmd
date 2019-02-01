'use strict';

/* global CloudCmd, gritty */

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');

require('../../css/terminal.css');

const exec = require('execon');
const load = require('load.js');
const DOM = require('../dom');
const Images = require('../dom/images');

const loadParallel = promisify(load.parallel);

const TITLE = 'Terminal';

const {Dialog} = DOM;
const {
    Key,
    config,
} = CloudCmd;

CloudCmd.Terminal = exports;

let Loaded;
let Terminal;

const loadAll = async () => {
    const {prefix} = CloudCmd;
    
    const prefixGritty = getPrefix();
    const js = `${prefixGritty}/gritty.js`;
    const css = `${prefix}/dist/terminal.css`;
    
    const [e] = await tryToCatch(loadParallel, [js, css]);
    
    if (e) {
        const src = e.target.src.replace(window.location.href, '');
        return Dialog.alert(TITLE, `file ${src} could not be loaded`);
    }
    
    Loaded = true;
};

module.exports.init = async () => {
    if (!config('terminal'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await loadAll();
    await create();
};

module.exports.show = show;
module.exports.hide = hide;

function hide () {
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
    
    Terminal = terminal;
    
    terminal.on('key', (char, {keyCode, shiftKey}) => {
        if (shiftKey && keyCode === Key.ESC) {
            hide();
        }
    });
    
    socket.on('connect', exec.with(authCheck, socket));
}

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert(TITLE, 'Wrong credentials!');
    });
}

function show(callback) {
    if (!Loaded)
        return;
    
    if (!config('terminal'))
        return;
    
    CloudCmd.View.show(Terminal.element, {
        afterShow: () => {
            if (Terminal)
                Terminal.focus();
            
            exec(callback);
        },
    });
}

