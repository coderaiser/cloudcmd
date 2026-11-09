import {rendy} from 'rendy';
import * as input from '../input.js';

export const render = (config, template) => {
    const {
        editor,
        engine,
        menu,
        packer,
        columns,
        theme,
        configAuth,
        configPort,
        ...obj
    } = input.convert(config);
    
    obj[`${menu}-selected`] = 'selected';
    obj[`${editor}-selected`] = 'selected';
    obj[`${engine}-selected`] = 'selected';
    obj[`${packer}-selected`] = 'selected';
    obj[`${columns}-selected`] = 'selected';
    obj[`${theme}-selected`] = 'selected';
    obj.configAuth = configAuth ? '' : 'hidden';
    obj.configPort = configPort ? '' : 'hidden';
    
    return rendy(template, obj);
};
