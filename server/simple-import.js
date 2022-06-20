'use strict';

module.exports.simpleImport = async (url) => {
    const result = await import(url);
    return result.default || result;
};

