'use strict';

/* global CloudCmd, gritty */

const {promisify} = require('es6-promisify');

require('../../css/terminal.css');

const exec = require('execon');
const load = require('../dom/load');
const DOM = require('../dom');
const Images = require('../dom/images');

const TITLE = 'Terminal';

const {Dialog} = DOM;
const {Key} = CloudCmd;

let Element;
let Loaded;
let Terminal;

const {config} = CloudCmd;

const loadAll = promisify((callback) => {
    const prefix = getPrefix();
    const url = prefix + '/gritty.js';
    
    DOM.load.js(url, (error) => {
        if (error)
            return Dialog.alert(TITLE, error.message);
        
        Loaded = true;
        exec(callback);
    });
});

module.exports.init = async () => {
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

function create() {
    Element = load({
        name: 'div',
        className : 'terminal',
    });
    
    const options = {
        env: getEnv(),
        prefix: getPrefix(),
        socketPath: CloudCmd.PREFIX,
        fontFamily: 'Droid Sans Mono',
    };
    
    const {socket, terminal} = gritty(Element, options);
    
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
    
    CloudCmd.View.show(Element, {
        afterShow: () => {
            if (Terminal)
                Terminal.focus();
            
            exec(callback);
        }
    });
}

