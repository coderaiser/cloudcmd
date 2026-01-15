/* global CloudCmd */
import exec from 'execon';
import {tryToCatch} from 'try-to-catch';
import {js as loadJS} from 'load.js';
import pascalCase from 'just-pascal-case';

const noJS = (a) => a.replace(/.js$/, '');

/**
 * function load modules
 * @params = {name, path, func, dobefore, arg}
 */
export const loadModule = (params) => {
    if (!params)
        return;
    
    const {path} = params;
    
    const name = path && noJS(pascalCase(path));
    const doBefore = params.dobefore;
    
    if (CloudCmd[name])
        return;
    
    CloudCmd[name] = async () => {
        exec(doBefore);
        
        const {DIR_MODULES} = CloudCmd;
        const pathFull = `${DIR_MODULES}/${path}.js`;
        
        await loadJS(pathFull);
        const newModule = async (f) => f && f();
        const module = CloudCmd[name];
        
        Object.assign(newModule, module);
        
        CloudCmd[name] = newModule;
        CloudCmd.log('init', name);
        
        await module.init();
        
        return newModule;
    };
    
    CloudCmd[name].show = async (...args) => {
        CloudCmd.log('show', name, args);
        const m = CloudCmd[name];
        
        const [e, a] = await tryToCatch(m);
        
        if (e)
            return;
        
        return await a.show(...args);
    };
};
