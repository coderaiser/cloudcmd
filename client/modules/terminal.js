'use strict';

/* global CloudCmd, gritty */

const exec = require('execon');
const load = require('../dom/load');
const DOM = require('../dom');
const Images = require('../dom/images');
const {Dialog} = DOM;

const TITLE = 'Terminal';

CloudCmd.Terminal = TerminalProto;

const {Key} = CloudCmd;

let Element;
let Loaded;
let Terminal;

const {config} = CloudCmd;

function TerminalProto() {
    const noop = () => {};
    
    if (!config('terminal'))
        return {
            show: noop
        };
    
    Images.show.load('top');
    
    exec.series([
        CloudCmd.View,
        loadAll,
        create,
        show,
    ]);
    
    Element = load({
        name: 'div',
        className : 'terminal',
    });
    
    return module.exports;
}

module.exports.show = show;

module.exports.hide = hide;

function hide () {
    CloudCmd.View.hide();
}

function getPrefix() {
    return CloudCmd.PREFIX + '/gritty';
}

function getEnv() {
    return {
        ACTIVE_DIR: DOM.getCurrentDirPath,
        PASSIVE_DIR: DOM.getNotCurrentDirPath,
        CURRENT_NAME: DOM.getCurrentName,
        CURRENT_PATH: DOM.getCurrentPath,
    };
}

function create(callback) {
    const options = {
        env: getEnv(),
        prefix: getPrefix(),
        socketPath: CloudCmd.PREFIX,
    };
    
    const {socket, terminal} = gritty(Element, options);
    
    terminal.focus();
    
    Terminal = terminal;
    
    terminal.on('key', (char, {keyCode, shiftKey}) => {
        if (shiftKey && keyCode === Key.ESC) {
            hide();
        }
    });
    
    socket.on('connect', exec.with(authCheck, socket));
    
    exec(callback);
}

function authCheck(spawn) {
    if (!config('auth'))
        return;
    
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert(TITLE, 'Wrong credentials!');
    });
}

function show(callback) {
    if (!Loaded)
        return;
    
    CloudCmd.View.show(Element, {
        afterShow: () => {
            if (Terminal) {
                Terminal.fit(); // lines corrupt without
                Terminal.focus();
            }
            
            exec(callback);
        }
    });
}

function loadAll(callback) {
    const prefix = getPrefix();
    const url = prefix + '/gritty.js';
    
    DOM.load.js(url, (error) => {
        if (error)
            return Dialog.alert(TITLE, error.message);
        
        Loaded = true;
        exec(callback);
    });
}

