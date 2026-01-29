/* global DOM */
import forEachKey from 'for-each-key';
import wraptile from 'wraptile';
import {format} from './format.mjs';

const {Dialog, Images} = DOM;

export const setListeners = (options) => (emitter) => {
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
    
    let noProgress = true;
    
    const listeners = {
        progress: (value) => {
            done = value === 100;
            progress.setProgress(value);
            noProgress = false;
        },
        
        end: () => {
            Images.hide();
            forEachKey(removeListener, listeners);
            progress.remove();
            
            if (lastError || done || noProgress)
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
            
            const [cancel] = await Dialog.confirm(`${error}
 Continue?`);
            
            if (!done && !cancel)
                return emitter.continue();
            
            emitter.abort();
            progress.remove();
        },
    };
    
    forEachKey(on, listeners);
};
