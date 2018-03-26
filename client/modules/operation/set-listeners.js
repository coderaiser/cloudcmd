'use strict';

/* global DOM */
/* global CloudCmd */

const {
    Images,
    Dialog,
} = DOM;

const forEachKey = require('../../../common/for-each-key');
const {
    TITLE,
} = CloudCmd;

module.exports = (options, callback) => (emitter) => {
    if (!callback) {
        callback = options;
        options = {};
    }
    
    let done;
    let lastError;
    
    const removeListener = emitter.removeListener.bind(emitter);
    const on = emitter.on.bind(emitter);
    
    const listeners = {
        progress: (value) => {
            done = value === 100;
            Images.setProgress(value);
        },
        
        end: () => {
            Images
                .hide()
                .clearProgress();
            
            forEachKey(removeListener, listeners);
            
            if (lastError || done)
                callback(lastError);
        },
        
        error: (error) => {
            lastError = error;
            
            if (options.noContinue) {
                listeners.end(error);
                Dialog.alert(TITLE, error);
                return;
            }
            
            Dialog.confirm(TITLE, error + '\n Continue?')
                .then(() => {
                    emitter.continue();
                }, () => {
                    emitter.abort();
                });
        }
    };
    
    forEachKey(on, listeners);
};

