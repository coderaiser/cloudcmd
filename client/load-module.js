/* global CloudCmd */
import exec from 'execon';
import {tryToCatch} from 'try-to-catch';
import load from 'load.js';
import pascalCase from 'just-pascal-case';

const noJS = (a) => a.replace(/.js$/, '');

const getName = (path) => noJS(pascalCase(path));

const registries = new WeakMap();

const getRegistry = () => {
    if (!registries.has(CloudCmd))
        registries.set(CloudCmd, new Map());
    
    return registries.get(CloudCmd);
};

export const loadModule = (params, overrides = {}) => {
    if (!params)
        return;
    
    const {loadJS = load.js} = overrides;
    const {path, requires = () => []} = params;
    
    const name = path && getName(path);
    const doBefore = params.dobefore;
    
    if (CloudCmd[name])
        return;
    
    const registry = getRegistry();
    
    let loading;
    
    const loadOnce = async () => {
        exec(doBefore);
        
        for (const dependency of requires())
            await registry.get(getName(dependency))();
        
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
    
    const loadModuleOnce = () => {
        loading = loading || loadOnce();
        
        return loading;
    };
    
    registry.set(name, loadModuleOnce);
    CloudCmd[name] = loadModuleOnce;
    
    CloudCmd[name].show = async (...args) => {
        CloudCmd.log('show', name, args);
        const m = CloudCmd[name];
        
        const [e, a] = await tryToCatch(m);
        
        if (e)
            return;
        
        return await a.show(...args);
    };
};
