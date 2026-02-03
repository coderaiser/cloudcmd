/* global CloudCmd */
import {callbackify} from 'node:util';
import rendy from 'rendy';
import itype from 'itype';
import * as load from 'load.js';
import {tryToCatch} from 'try-to-catch';
import {findObjByNameInArr} from '#common/util';
import * as Files from '#dom/files';

export const loadRemote = callbackify(async (name, options) => {
    const {prefix, config} = CloudCmd;
    const o = options;
    
    if (o.name && window[o.name])
        return;
    
    const modules = await Files.get('modules');
    
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
            return;
    }
    
    await load.parallel(localURL);
});
