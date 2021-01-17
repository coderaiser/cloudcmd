'use strict';

const noop = () => {};

module.exports.getDOM = () => {
    const prompt = Promise.resolve.bind(Promise);
    const CurrentInfo = {
        element: {},
        files: [],
    };
    
    const Buffer = {
        copy: noop,
        paste: noop,
    };
    
    const Dialog = {
        prompt,
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
        
        config: noop,
        _config: noop,
    };
};

