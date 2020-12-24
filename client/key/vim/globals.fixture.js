export const getDOM = () => {
    const prompt = Promise.resolve.bind(Promise);
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

export const getCloudCmd = () => {
    const show = () => {};
    
    return {
        Operation:  {
            show,
        },
    };
};

