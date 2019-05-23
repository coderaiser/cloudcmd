'use strict';

const tryToCatch = require('try-to-catch/legacy');

const {encode} = require('../../common/entity');

const Images = require('./images');
const IO = require('./io');
const Dialog = require('./dialog');

const handleError = (promise) => async (...args) => {
    const [e, data] = await tryToCatch(promise, ...args);
    
    if (!e)
        return [e, data];
    
    const encoded = encode(e.message);
    
    Images.show.error(encoded);
    Dialog.alert(encoded);
    
    return [e, data];
};

module.exports.delete = handleError(IO.delete);
module.exports.patch = handleError(IO.patch);
module.exports.write = handleError(IO.write);
module.exports.read = handleError(IO.read);
module.exports.cp = handleError(IO.cp);
module.exports.pack = handleError(IO.pack);
module.exports.extract = handleError(IO.extract);
module.exports.mv = handleError(IO.mv);

module.exports.Config = {
    read: handleError(IO.Config.read),
    write: handleError(IO.Config.write),
};

module.exports.Markdown = {
    read: handleError(IO.Markdown.read),
    render: handleError(IO.Markdown.render),
};

