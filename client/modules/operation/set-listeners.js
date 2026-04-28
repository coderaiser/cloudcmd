/* global DOM */
import forEachKey from 'for-each-key';
import wraptile from 'wraptile';
import {format} from './format.js';

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
    
    const onAbort = wraptile(({emitter, operation}) => {
        emitter.abort();
        
        const msg = `${operation} aborted`;
        
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
            
            callback();
        },
        
        error: async (error) => {
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
