'use strict';

const itype = require('itype/legacy');

module.exports = new EventsProto();

function EventsProto() {
    const Events = this;
    
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
            if (!/element$/.test(type))
                throw Error('unknown eventName: ' + type);
            
            parseArgs(
                args[EVENT_NAME],
                args[ELEMENT],
                listener,
                callback
            );
            break;
        
        case 'string':
            isFunc = itype.function(element);
            
            if (isFunc) {
                listener   = element;
                element    = null;
            }
            
            if (!element)
                element = window;
            
            callback(element, [
                eventName,
                listener,
                false
            ]);
            break;
        
        case 'array':
            eventName.forEach((eventName) => {
                parseArgs(
                    eventName,
                    element,
                    listener,
                    callback
                );
            });
            break;
        
        case 'object':
            Object.keys(eventName).forEach((name) => {
                const eventListener = eventName[name];
                
                parseArgs(
                    name,
                    element,
                    eventListener,
                    callback
                );
            });
           
            break;
        }
    }
    
    /**
     * safe add event listener
     *
     * @param type
     * @param element {document by default}
     * @param listener
     */
    this.add = (type, element, listener) => {
        checkType(type);
        
        parseArgs(type, element, listener, (element, args) => {
            element.addEventListener.apply(element, args);
        });
        
        return Events;
    };
    
    /**
     * safe add event listener
     *
     * @param type
     * @param listener
     * @param element {document by default}
     */
    this.addOnce = (type, element, listener) => {
        const once = (event) => {
            Events.remove(type, element, once);
            listener(event);
        };
        
        if (!listener) {
            listener    = element;
            element     = null;
        }
        
        this.add(type, element, once);
        
        return Events;
    };
    
    /**
     * safe remove event listener
     *
     * @param type
     * @param listener
     * @param element {document by default}
     */
    this.remove = (type, element, listener) => {
        checkType(type);
        
        parseArgs(type, element, listener, (element, args) => {
            element.removeEventListener.apply(element, args);
        });
        
        return Events;
    };
    
    /**
     * safe add event keydown listener
     *
     * @param listener
     */
    this.addKey = function(...argsArr) {
        const name = 'keydown';
        const args = [name].concat(argsArr);
        
        return Events.add(...args);
    };
    
    /**
     * safe remove event click listener
     *
     * @param listener
     */
    this.rmKey = function(...argsArr) {
        const name = 'keydown';
        const args = [name].concat(argsArr);
        
        return Events.remove(...args);
    };
    
    /**
     * safe add event click listener
     *
     * @param listener
     */
    this.addClick = function(...argsArr) {
        const name = 'click';
        const args = [name].concat(argsArr);
        
        return Events.add(...args);
    };
    
    /**
     * safe remove event click listener
     *
     * @param listener
     */
    this.rmClick = function(...argsArr) {
        const name = 'click';
        const args = [name].concat(argsArr);
        
        return Events.remove(...args);
    };
    
    this.addContextMenu = function(...argsArr) {
        const name = 'contextmenu';
        const args = [name].concat(argsArr);
        
        return Events.add(...args);
    };
    
    /**
     * safe add event click listener
     *
     * @param listener
     */
    this.addError = function(...argsArr) {
        const name = 'error';
        const args = [name].concat(argsArr);
        
        return Events.add(...args);
    };
    
    /**
     * safe add load click listener
     *
     * @param listener
     */
    this.addLoad = function(...argsArr) {
        const name = 'load';
        const args = [name].concat(argsArr);
        
        return Events.add(...args);
    };
    
    function checkType(type) {
        if (!type)
            throw Error('type could not be empty!');
    }
}

