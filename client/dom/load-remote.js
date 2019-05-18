'use strict';

/* global CloudCmd */

const exec = require('execon');
const rendy = require('rendy/legacy');
const itype = require('itype/legacy');
const wraptile = require('wraptile/legacy');
const load = require('load.js');

const {findObjByNameInArr} = require('../../common/util');

const Files = require('./files');
const parallel = wraptile(load.parallel);

module.exports = (name, options, callback = options) => {
    const {prefix, config} = CloudCmd;
    const o = options;
    
    if (o.name && window[o.name])
        return callback();
    
    Files.get('modules').then((modules) => {
        const online = config('online') && navigator.onLine;
        const module = findObjByNameInArr(modules.remote, name);
        
        const isArray = itype.array(module.local);
        const {version} = module;
        
        let remoteTmpls;
        let local;
        
        if (isArray) {
            remoteTmpls = module.remote;
            local = module.local;
        } else {
            remoteTmpls = [module.remote];
            local = [module.local];
        }
        
        const localURL = local.map((url) => {
            return prefix + url;
        });
        
        const remoteURL = remoteTmpls.map((tmpl) => {
            return rendy(tmpl, {
                version,
            });
        });
        
        const on = funcON(localURL, remoteURL, callback);
        const off = funcOFF(localURL, callback);
        
        exec.if(online, on, off);
    });
};

function funcOFF(local, callback) {
    return parallel(local, callback);
}

function funcON (local, remote,callback) {
    return parallel(remote, (error) => {
        if (error)
            return funcOFF();
        
        callback();
    });
}

