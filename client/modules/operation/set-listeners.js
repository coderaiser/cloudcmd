'use strict';

/* global DOM */

const {
    Dialog,
    Images,
} = DOM;

const forEachKey = require('for-each-key/legacy');
const wraptile = require('wraptile/legacy');

const format = require('./format');

module.exports = (options) => (emitter) => {
    const {
        operation,
        callback,
        noContinue,
        from,
        to,
    } = options;
    
    let done;
    let lastError;
    
    const onAbort = wraptile(({emitter, operation}) => {
        emitter.abort();
        
        const msg = `${operation} aborted`;
        lastError = true;
        
        Dialog.alert(msg, {
            cancel: false,
        });
    });
    
    const removeListener = emitter.removeListener.bind(emitter);
    const on = emitter.on.bind(emitter);
    
    const message = format(operation, from, to);
    const progress = Dialog.progress(message);
    
    progress.catch(onAbort({
        emitter,
        operation,
    }));
    
    const listeners = {
        progress: (value) => {
            done = value === 100;
            progress.setProgress(value);
        },
        
        end: () => {
            Images.hide();
            forEachKey(removeListener, listeners);
            progress.remove();
            
            if (lastError || done)
                callback();
        },
        
        error: async (error) => {
            lastError = error;
            
            if (noContinue) {
                listeners.end(error);
                Dialog.alert(error);
                progress.remove();
                return;
            }
            
            const [cancel] = await Dialog.confirm(error + '\n Continue?');
            
            if (!cancel)
                emitter.continue();
            
            emitter.abort();
            progress.remove();
        },
    };
    
    forEachKey(on, listeners);
};

