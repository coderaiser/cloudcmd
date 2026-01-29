'use strict';

/* global CloudCmd */
const rendy = require('rendy');
const itype = require('itype');
const load = require('load.js');
const {tryToCatch} = require('try-to-catch');

const {findObjByNameInArr} = require('#common/util');

const Files = require('#dom/files');

module.exports = (name, options, callback = options) => {
    const {prefix, config} = CloudCmd;
    const o = options;
    
    if (o.name && window[o.name])
        return callback();
    
    Files.get('modules').then(async (modules) => {
        const online = config('online') && navigator.onLine;
        const module = findObjByNameInArr(modules.remote, name);
        
        const isArray = itype.array(module.local);
        const {version} = module;
        
        let remoteTmpls;
        let local;
        
        if (isArray) {
            remoteTmpls = module.remote;
            ({local} = module);
        } else {
            remoteTmpls = [module.remote];
            local = [module.local];
        }
        
        const localURL = local.map((url) => prefix + url);
        
        const remoteURL = remoteTmpls.map((tmpl) => {
            return rendy(tmpl, {
                version,
            });
        });
        
        if (online) {
            const [e] = await tryToCatch(load.parallel, remoteURL);
            
            if (!e)
                return callback();
        }
        
        const [e] = await tryToCatch(load.parallel, localURL);
        callback(e);
    });
};
