import {createRequire} from 'node:module';
import {tryCatch} from 'try-catch';

const require = createRequire(import.meta.url);

const noop = (req, res, next) => {
    next && next();
};

noop.listen = noop;

const parseDefault = (a) => a.default || a;
const _getModule = (a) => parseDefault(require(a));

export default (config, arg, overrides = {}) => {
    const {
        getModule = _getModule,
    } = overrides;
    
    if (!config('terminal'))
        return noop;
    
    const [e, terminalModule] = tryCatch(getModule, config('terminalPath'));
    
    if (!e && !arg)
        return terminalModule;
    
    if (!e)
        return terminalModule(arg);
    
    config('terminal', false);
    console.log(`cloudcmd --terminal: ${e.message}`);
    
    return noop;
};
