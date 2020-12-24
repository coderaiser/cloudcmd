/* global CloudCmd */
/* global Util */
/* global DOM */
/* global Console */

CloudCmd.Konsole = exports;

import exec from 'execon';
import currify from 'currify';
import tryToCatch from 'try-to-catch';
const loadJS = require('load.js').js;
import createElement from '@cloudcmd/create-element';

import Images from '../dom/images.js';
const {
    Dialog,
    CurrentInfo:Info,
} = DOM;

const rmLastSlash = (a) => a.replace(/\/$/, '') || '/';

let konsole;
const {config} = CloudCmd;

const cd = currify((fn, dir) => fn(`cd ${rmLastSlash(dir)}`));

const Name = 'Konsole';

let Element;
let Loaded;

export const init = async () => {
    if (!config('console'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await load();
    await create();
};

export const hide = () => {
    CloudCmd.View.hide();
};

export const clear = () => {
    konsole.clear();
};

function getPrefix() {
    return CloudCmd.prefix + '/console';
}

function getPrefixSocket() {
    return CloudCmd.prefixSocket + '/console';
}

function getEnv() {
    return {
        ACTIVE_DIR: DOM.getCurrentDirPath.bind(DOM),
        PASSIVE_DIR: DOM.getNotCurrentDirPath.bind(DOM),
        CURRENT_NAME: DOM.getCurrentName.bind(DOM),
        CURRENT_PATH: () => {
            return Info.path;
        },
    };
}

async function onPath(path) {
    if (Info.dirPath === path)
        return;
    
    await CloudCmd.loadDir({
        path,
    });
}

const getDirPath = () => {
    if (config('syncConsolePath'))
        return Info.dirPath;
};

const create = async () => {
    const options = {
        cwd: getDirPath(),
        env: getEnv(),
        prefix: getPrefix(),
        prefixSocket: getPrefixSocket(),
        socketPath: CloudCmd.prefix,
    };
    
    Element = createElement('div', {
        className: 'console',
    });
    
    konsole = await Console(Element, options);
    
    konsole.on('connect', exec.with(authCheck, konsole));
    konsole.on('path', config.if('syncConsolePath', onPath));
    
    CloudCmd.on('active-dir', config.if('syncConsolePath', cd(konsole.handler)));
    
    konsole.addShortCuts({
        P: () => {
            const command = konsole.getPromptText();
            const path = DOM.getCurrentDirPath();
            
            konsole.setPromptText(command + path);
        },
    });
};

function authCheck(konsole) {
    konsole.emit('auth', config('username'), config('password'));
    
    konsole.on('reject', () => {
        Dialog.alert('Wrong credentials!');
    });
}

export const show = (callback) => {
    if (!Loaded)
        return;
    
    if (!config('console'))
        return;
    
    CloudCmd.View.show(Element, {
        afterShow: () => {
            konsole.focus();
            exec(callback);
        },
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
        return Dialog.alert(error.message, {
            cancel: false,
        });
};

