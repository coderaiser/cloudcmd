import simpleImport from './simple-import.js';
import tryToCatch from 'try-catch';

const noop = (req, res, next) => {
    next && next();
};

noop.listen = noop;

export default async (config, arg) => {
    if (!config('terminal'))
        return noop;
    
    const [e, terminalModule] = await tryToCatch(simpleImport, config('terminalPath'));
    
    if (!e && !arg)
        return terminalModule;
    
    if (!e)
        return terminalModule(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
};

