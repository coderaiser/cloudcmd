'use strict';

/* global CloudCmd */

const exec = require('execon');
const tryToCatch = require('try-to-catch/legacy');
const {
    kebabToCamelCase,
} = require('../common/util');

/**
 * function load modules
 * @params = {name, path, func, dobefore, arg}
 */
module.exports = function loadModule(params) {
    if (!params)
        return;
    
    let path = params.path;
    const name = params.name || path && kebabToCamelCase(path);
    const doBefore = params.dobefore;
    
    if (CloudCmd[name])
        return;
    
    CloudCmd[name] = () => {
        exec(doBefore);
        return import(`./modules/${path}` /* webpackChunkName: "cloudcmd-" */).then(async (module) => {
            const newModule = async (f) => f && f();
            
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
        
        a.show(...args);
    };
};

