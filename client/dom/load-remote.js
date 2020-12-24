/* global CloudCmd */

import rendy from 'rendy';
import itype from 'itype';
import load from 'load.js';
import tryToCatch from 'try-to-catch';

import {findObjByNameInArr} from '../../common/util.js';

import Files from './files.js';

export default (name, options, callback = options) => {
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
        
        if (online) {
            const [e] = await tryToCatch(load.parallel, remoteURL);
            
            if (!e)
                return callback();
        }
        
        const [e] = await tryToCatch(load.parallel, localURL);
        callback(e);
    });
};

