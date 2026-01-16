import deepmerge from 'deepmerge';
import originalModules from '../json/modules.json' with {
    type: 'json',
};

export default (modules) => {
    const result = deepmerge(originalModules, modules || {});
    
    return (req, res, next) => {
        if (req.url !== '/json/modules.json')
            return next();
        
        res.send(result);
    };
};
