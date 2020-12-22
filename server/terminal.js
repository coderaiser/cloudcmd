import {createRequire} from 'module';
import tryCatch from 'try-catch';

const require = createRequire(import.meta.url);

const noop = (req, res, next) => {
    next && next();
};

noop.listen = noop;

export default (config, arg) => {
    if (!config('terminal'))
        return noop;
    
    const [e, terminalModule] = tryCatch(require, config('terminalPath'));
    
    if (!e && !arg)
        return terminalModule;
    
    if (!e)
        return terminalModule(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
};

