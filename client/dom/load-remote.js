'use strict';

/* global CloudCmd */

const exec = require('execon');
const rendy = require('rendy');
const itype = require('itype/legacy');
const {findObjByNameInArr} = require('../../common/util');

const load = require('./load');
const Files = require('./files');

module.exports = (name, options, callback = options) => {
    const {PREFIX, config} = CloudCmd;
    const o = options;
    
    if (o.name && window[o.name])
        return callback();
    
    Files.get('modules', (error, modules) => {
        const online = config('online') && navigator.onLine;
        
        const remoteObj = findObjByNameInArr(modules, 'remote');
        const module = findObjByNameInArr(remoteObj, name);
        
        const isArray = itype.array(module.local);
        const version = module.version;
        
        let remoteTmpls, local;
        if (isArray) {
            remoteTmpls = module.remote;
            local       = module.local;
        } else {
            remoteTmpls  = [module.remote];
            local        = [module.local];
        }
        
        const localURL = local.map((url) => {
            return PREFIX + url;
        });
        
        const remoteURL = remoteTmpls.map((tmpl) => {
            return rendy(tmpl, {
                version: version
            });
        });
        
        const on = funcON(localURL, remoteURL, callback);
        const off = funcOFF(localURL, callback);
        
        exec.if(online, on, off);
    });
};

function funcOFF(local, callback) {
    return () => {
        load.parallel(local, callback);
    };
}

function funcON (local, remote,callback) {
    return () => {
        load.parallel(remote, (error) => {
            if (error)
                return funcOFF();
            
            callback();
        });
    };
}

