'use strict';

/* global CloudCmd, gritty */

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch');

require('../../css/terminal.css');

const exec = require('execon');
const load = require('../dom/load');
const DOM = require('../dom');
const Images = require('../dom/images');

const loadParallel = promisify(load.parallel);

const TITLE = 'Terminal';

const {Dialog} = DOM;
const {Key} = CloudCmd;

CloudCmd.Terminal = exports;

let Element;
let Loaded;
let Terminal;

const {config} = CloudCmd;

const loadAll = async () => {
    const {
        PREFIX,
    } = CloudCmd;
    
    const prefix = getPrefix();
    const js = `${prefix}/gritty.js`;
    const css = `${PREFIX}/dist/terminal.css`;
    
    const [e] = await tryToCatch(loadParallel, [js, css]);
    
    if (e)
        return Dialog.alert(TITLE, e.message);
    
    Loaded = true;
};

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

