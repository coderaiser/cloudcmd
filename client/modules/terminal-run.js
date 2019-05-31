'use strict';

/* global CloudCmd, gritty */

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');
const fullstore = require('fullstore/legacy');

require('../../css/terminal.css');

const exec = require('execon');
const load = require('load.js');
const DOM = require('../dom');
const Images = require('../dom/images');

const loadParallel = promisify(load.parallel);

const {Dialog} = DOM;
const {
    Key,
    config,
} = CloudCmd;

CloudCmd.TerminalRun = exports;

let Loaded;
let Terminal;
let Socket;

const exitCodeStore = fullstore();

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

module.exports.init = async () => {
    if (!config('terminal'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await loadAll();
};

module.exports.show = promisify((options = {}, fn) => {
    if (!Loaded)
        return;
    
    if (!config('terminal'))
        return;
    
    create(options);
    
    CloudCmd.View.show(Terminal.element, {
        afterShow: () => {
            Terminal.focus();
        },
        afterClose: (/* exec.series args */) => {
            fn(null, exitCodeStore());
        },
    });
});

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

function create(createOptions) {
    const {
        cwd = DOM.getCurrentDirPath(),
        command,
        autoClose,
        closeMessage = 'Press any key to close Terminal...',
    } = createOptions;
    
    const options = {
        cwd,
        env: getEnv(),
        prefix: getPrefixSocket(),
        socketPath: CloudCmd.prefix,
        fontFamily: 'Droid Sans Mono',
        command,
        autoRestart: false,
    };
    
    let commandExit = false;
    
    const {socket, terminal} = gritty(document.body, options);
    
    Socket = socket;
    Terminal = terminal;
    
    Terminal.on('key', (char, {keyCode, shiftKey}) => {
        if (commandExit)
            hide();
        
        if (shiftKey && keyCode === Key.ESC) {
            hide();
        }
    });
    
    Socket.on('exit', (code) => {
        exitCodeStore(code);
        
        if (autoClose)
            return hide();
        
        terminal.write(`\n${closeMessage}`);
        commandExit = true;
    });
    
    Socket.on('connect', exec.with(authCheck, socket));
}

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert('Wrong credentials!');
    });
}

