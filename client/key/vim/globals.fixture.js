'use strict';

module.exports.getDOM = () => {
    const resolve = Promise.resolve.bind(Promise);
    const CurrentInfo = {
        element: {},
        files: [],
    };
    
    const noop = () => {};
    const Buffer = {
        copy: noop,
        paste: noop,
    };
    
    const Dialog = {
        prompt: resolve,
    };
    
    return {
        Buffer,
        CurrentInfo,
        Dialog,
        selectFile: noop,
        unselectFile: noop,
        unselectFiles: noop,
        setCurrentFile: noop,
        getCurrentName: noop,
        setCurrentByName: noop,
        toggleSelectedFile: noop,
    };
};

module.exports.getCloudCmd = () => {
    const show = () => {};
    
    return {
        Operation:  {
            show,
        },
    };
};

