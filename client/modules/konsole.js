'use strict';

/* global CloudCmd */
/* global Util */
/* global DOM */
/* global Console */

const exec = require('execon');
const currify = require('currify/legacy');
const Images = require('../dom/images');
const {
    Dialog,
    CurrentInfo:Info,
} = DOM;

const rmLastSlash = (a) => a.replace(/\/$/, '') || '/';

CloudCmd.Konsole = ConsoleProto;

function ConsoleProto() {
    let konsole;
    const {config} = CloudCmd;
    
    const noop = () => {};
    const cd = currify((fn, dir) => fn(`cd ${rmLastSlash(dir)}`));
    
    if (!config('console'))
        return {
            show: noop
        };
    
    const Name = 'Konsole';
    const TITLE = 'Console';
    
    let Element;
    let Loaded;
    
    const Konsole = this;
    
    function init() {
        Images.show.load('top');
        
        exec.series([
            CloudCmd.View,
            load,
            create,
            Konsole.show,
        ]);
        
        Element = DOM.load({
            name        : 'div',
            className   : 'console'
        });
    }
    
    this.hide = () => {
        CloudCmd.View.hide();
    };
    
    this.clear = () => {
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
    
    function create(callback) {
        const options = {
            cwd: getDirPath(),
            env: getEnv(),
            prefix: getPrefix(),
            socketPath: CloudCmd.PREFIX,
        };
        
        konsole = Console(Element, options, (spawn) => {
            spawn.on('connect', exec.with(authCheck, spawn));
            spawn.on('path', config.if('syncConsolePath', onPath));
            
            CloudCmd.on('active-dir', config.if('syncConsolePath', cd(spawn.handler)));
            
            exec(callback);
        });
        
        konsole.addShortCuts({
            'P': () => {
                const command = Console.getPromptText();
                const path = DOM.getCurrentDirPath();
                
                Console.setPromptText(command + path);
            }
        });
    }
    
    function authCheck(spawn) {
        spawn.emit('auth', config('username'), config('password'));
        
        spawn.on('reject', () => {
            Dialog.alert(TITLE, 'Wrong credentials!');
        });
    }
    
    this.show = (callback) => {
        if (!Loaded)
            return;
        
        CloudCmd.View.show(Element, {
            afterShow: () => {
                konsole.focus();
                exec(callback);
            }
        });
    };
    
    function load(callback) {
        const prefix = getPrefix();
        const url = prefix + '/console.js';
        
        DOM.load.js(url, (error) => {
            if (error)
                return Dialog.alert(TITLE, error.message);
            
            Loaded = true;
            Util.timeEnd(Name + ' load');
            exec(callback);
        });
        
        Util.time(Name + ' load');
    }
    
    init();
}

