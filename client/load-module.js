'use strict';

/* global CloudCmd */

const exec = require('execon');
const tryToCatch = require('try-to-catch/legacy');
const {promisify} = require('es6-promisify');
const loadJS = promisify(require('load.js').js);

const pascalCase = require('just-pascal-case');
const noJS = (a) => a.replace(/.js$/, '');

/**
 * function load modules
 * @params = {name, path, func, dobefore, arg}
 */
module.exports = function loadModule(params) {
    if (!params)
        return;
    
    const {
        path,
        name = path && noJS(pascalCase(path)),
    } = params;
    const doBefore = params.dobefore;
    
    if (CloudCmd[name])
        return;
    
    CloudCmd[name] = () => {
        exec(doBefore);
        const {prefix} = CloudCmd;
        const pathFull = prefix + CloudCmd.DIRCLIENT_MODULES + path + '.js';
        
        return loadJS(pathFull).then(async () => {
            const newModule = async (f) => f && f();
            const module = CloudCmd[name];
            
            Object.assign(newModule, module);
            
            CloudCmd[name] = newModule;
            
            CloudCmd.log('init', name);
            await module.init();
            
            return newModule;
        });
    };
    
    CloudCmd[name].show = async (...args) => {
        CloudCmd.log('show', name, args);
        const m = CloudCmd[name];
        
        const [e, a] = await tryToCatch(m);
        
        if (e)
            return console.error(e);
        
        await a.show(...args);
    };
};

