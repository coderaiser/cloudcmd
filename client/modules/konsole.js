'use strict';

/* global CloudCmd */
/* global Util */
/* global DOM */
/* global Console */

CloudCmd.Konsole = exports;

const exec = require('execon');
const {promisify} = require('es6-promisify');
const currify = require('currify/legacy');
const tryToCatch = require('try-to-catch/legacy');
const loadJS = promisify(require('load.js').js);
const createElement = require('@cloudcmd/create-element');

const Images = require('../dom/images');
const {
    Dialog,
    CurrentInfo:Info,
} = DOM;

const rmLastSlash = (a) => a.replace(/\/$/, '') || '/';

let konsole;
const {config} = CloudCmd;

const cd = currify((fn, dir) => fn(`cd ${rmLastSlash(dir)}`));

const Name = 'Konsole';
const TITLE = 'Console';

let Element;
let Loaded;

module.exports.init = async () => {
    if (!config('console'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await load();
    await create();
};

module.exports.hide = () => {
    CloudCmd.View.hide();
};

module.exports.clear = () => {
    konsole.clear();
};

function getPrefix() {
    return CloudCmd.PREFIX + '/console';
}

function getEnv() {
    return {
        ACTIVE_DIR: DOM.getCurrentDirPath.bind(DOM),
        PASSIVE_DIR: DOM.getNotCurrentDirPath.bind(DOM),
        CURRENT_NAME: DOM.getCurrentName.bind(DOM),
        CURRENT_PATH: () => {
            return Info.path;
        }
    };
}

function onPath(path) {
    if (Info.dirPath === path)
        return;
    
    CloudCmd.loadDir({
        path,
    });
}

const getDirPath = () => {
    if (config('syncConsolePath'))
        return Info.dirPath;
};

const create = promisify((callback) => {
    const options = {
        cwd: getDirPath(),
        env: getEnv(),
        prefix: getPrefix(),
        socketPath: CloudCmd.PREFIX,
    };
    
    Element = createElement('div', {
        className: 'console',
    });
    
    konsole = Console(Element, options, (spawn) => {
        spawn.on('connect', exec.with(authCheck, spawn));
        spawn.on('path', config.if('syncConsolePath', onPath));
        
        CloudCmd.on('active-dir', config.if('syncConsolePath', cd(spawn.handler)));
        
        exec(callback);
    });
    
    konsole.addShortCuts({
        'P': () => {
            const command = konsole.getPromptText();
            const path = DOM.getCurrentDirPath();
            
            konsole.setPromptText(command + path);
        }
    });
});

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert(TITLE, 'Wrong credentials!');
    });
}

module.exports.show = (callback) => {
    if (!Loaded)
        return;
    
    if (!config('console'))
        return;
    
    CloudCmd.View.show(Element, {
        afterShow: () => {
            konsole.focus();
            exec(callback);
        }
    });
};

const load = async () => {
    Util.time(Name + ' load');
    
    const prefix = getPrefix();
    const url = prefix + '/console.js';
    const [error] = await tryToCatch(loadJS, url);
    
    Loaded = true;
    Util.timeEnd(Name + ' load');
    
    if (error)
        return Dialog.alert(TITLE, error.message, {
            cancel: false
        });
};

