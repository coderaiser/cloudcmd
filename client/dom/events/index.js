import itype from 'itype';
import * as EventStore from './event-store.js';

/**
 * safe add event listener
 *
 * @param type
 * @param element - document by default
 * @param listener
 */
export const add = (type, element, listener) => {
    checkType(type);
    
    parseArgs(type, element, listener, (element, args) => {
        const [name, fn, options] = args;
        
        element.addEventListener(name, fn, options);
        EventStore.add(element, name, fn);
    });
    
    return Events;
};

/**
 * safe add event listener
 *
 * @param type
 * @param listener
 * @param element - document by default
 */
export const addOnce = (type, element, listener) => {
    const once = (event) => {
        Events.remove(type, element, once);
        listener(event);
    };
    
    if (!listener) {
        listener = element;
        element = null;
    }
    
    add(type, element, once);
    
    return Events;
};

/**
 * safe remove event listener
 *
 * @param type
 * @param listener
 * @param element - document by default
 */
export const remove = (type, element, listener) => {
    checkType(type);
    
    parseArgs(type, element, listener, (element, args) => {
        element.removeEventListener(...args);
    });
    
    return Events;
};

/**
 * remove all added event listeners
 */
export const removeAll = () => {
    const events = EventStore.get();
    
    for (const [el, name, fn] of events)
        el.removeEventListener(name, fn);
    
    EventStore.clear();
};

/**
 * safe add event keydown listener
 *
 * @param args
 */
export const addKey = function(...args) {
    return add('keydown', ...args);
};

/**
 * safe remove event click listener
 *
 * @param args
 */
export const rmKey = function(...args) {
    return Events.remove('keydown', ...args);
};

/**
 * safe add event click listener
 */
export const addClick = function(...args) {
    return Events.add('click', ...args);
};

/**
 * safe remove event click listener
 */
export const rmClick = function(...args) {
    return remove('click', ...args);
};

export const addContextMenu = function(...args) {
    return add('contextmenu', ...args);
};

/**
 * safe add load listener
 */
export const addLoad = function(...args) {
    return add('load', ...args);
};

function checkType(type) {
    if (!type)
        throw Error('type could not be empty!');
}

const getEventOptions = (eventName) => {
    if (eventName !== 'touchstart')
        return false;
    
    return {
        passive: true,
    };
};

function parseArgs(eventName, element, listener, callback) {
    let isFunc;
    const args = [
        eventName,
        element,
        listener,
        callback,
    ];
    
    const EVENT_NAME = 1;
    const ELEMENT = 0;
    const type = itype(eventName);
    
    switch(type) {
    default:
        if (!type.endsWith('element'))
            throw Error(`unknown eventName: ${type}`);
        
        parseArgs(args[EVENT_NAME], args[ELEMENT], listener, callback);
        break;
    
    case 'string':
        isFunc = itype.function(element);
        
        if (isFunc) {
            listener = element;
            element = null;
        }
        
        if (!element)
            element = window;
        
        callback(element, [
            eventName,
            listener,
            getEventOptions(eventName),
        ]);
        break;
    
    case 'array':
        
        for (const name of eventName) {
            parseArgs(name, element, listener, callback);
        }
        
        break;
    
    case 'object':
        
        for (const name of Object.keys(eventName)) {
            const eventListener = eventName[name];
            
            parseArgs(name, element, eventListener, callback);
        }
        
        break;
    }
}

const Events = {
    add,
    addClick,
    addContextMenu,
    addKey,
    addLoad,
    addOnce,
    remove,
    removeAll,
    rmClick,
    rmKey,
};
