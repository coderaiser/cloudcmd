import deepmerge from 'deepmerge';
import readjson from 'readjson';

const originalModules = await readjson(new URL('../json/modules.json', import.meta.url));

export default (modules) => {
    const result = deepmerge(originalModules, modules || {});
    
    return (req, res, next) => {
        if (req.url !== '/json/modules.json')
            return next();
        
        res.send(result);
    };
};

