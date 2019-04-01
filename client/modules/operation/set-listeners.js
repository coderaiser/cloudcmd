'use strict';

/* global DOM */
/* global CloudCmd */

const smalltalk = require('smalltalk');

const {
    Dialog,
    Images,
} = DOM;

const forEachKey = require('for-each-key/legacy');
const wraptile = require('wraptile/legacy');
const {TITLE} = CloudCmd;

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
        
        Dialog.alert(TITLE, msg, {
            noCancel: true,
        });
    });
    
    const removeListener = emitter.removeListener.bind(emitter);
    const on = emitter.on.bind(emitter);
    
    const message = format(operation, from, to);
    
    const progress = smalltalk.progress(TITLE, message);
    
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
            
            if (lastError || done)
                callback();
        },
        
        error: (error) => {
            lastError = error;
            
            if (noContinue) {
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
        },
    };
    
    forEachKey(on, listeners);
};

