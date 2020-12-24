import tryToCatch from 'try-to-catch';

import {encode} from '../../common/entity.js';

import Images from './images.js';
import IO from './io.js';
import Dialog from './dialog.js';

const handleError = (promise) => async (...args) => {
    const [e, data] = await tryToCatch(promise, ...args);
    
    if (!e)
        return [e, data];
    
    const encoded = encode(e.message);
    
    Images.show.error(encoded);
    Dialog.alert(encoded);
    
    return [e, data];
};

export const remove = handleError(IO.remove);
export const patch = handleError(IO.patch);
export const write = handleError(IO.write);
export const createDirectory = handleError(IO.createDirectory);
export const read = handleError(IO.read);
export const copy = handleError(IO.copy);
export const pack = handleError(IO.pack);
export const extract = handleError(IO.extract);
export const move = handleError(IO.move);
export const rename = handleError(IO.rename);

export const Config = {
    read: handleError(IO.Config.read),
    write: handleError(IO.Config.write),
};

export const Markdown = {
    read: handleError(IO.Markdown.read),
    render: handleError(IO.Markdown.render),
};

