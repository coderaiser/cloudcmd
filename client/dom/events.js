'use strict';

const itype = require('itype/legacy');

module.exports = new EventsProto();

function EventsProto() {
    const Events = this;
    
    function parseArgs(eventName, element, listener, callback) {
        let isFunc;
        
        const EVENT_NAME = 1;
        const ELEMENT = 0;
        const type = itype(eventName);
        
        switch(type) {
        default:
            if (!/element$/.test(type))
                throw Error('unknown eventName: ' + type);
            
            parseArgs(
                arguments[EVENT_NAME],
                arguments[ELEMENT],
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
        
        parseArgs(type, element, listener, function(element, args) {
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
        var once = (event) => {
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
        
        return this.add(...args);
    };
    
    /**
     * safe remove event click listener
     *
     * @param listener
     */
    this.rmKey = function(...argsArr) {
        const name = 'keydown';
        const args = [name].concat(argsArr);
        
        return this.remove(...args);
    };
    
    /**
     * safe add event click listener
     *
     * @param listener
     */
    this.addClick = function(...argsArr) {
        const name = 'click';
        const args = [name].concat(argsArr);
        
        return this.add(...args);
    };
    
    /**
     * safe remove event click listener
     *
     * @param listener
     */
    this.rmClick = function(...argsArr) {
        const name = 'click';
        const args = [name].concat(argsArr);
        
        return this.remove(...args);
    };
    
    this.addContextMenu = function(...argsArr) {
        const name = 'contextmenu';
        const args = [name].concat(argsArr);
        
        return this.add(...args);
    };
    
    /**
     * safe add event click listener
     *
     * @param listener
     */
    this.addError = function(...argsArr) {
        const name = 'error';
        const args = [name].concat(argsArr);
        
        return this.add(...args);
    };
    
    /**
     * safe add load click listener
     *
     * @param listener
     */
    this.addLoad = function(...argsArr) {
        const name = 'load';
        const args = [name].concat(argsArr);
        
        return this.add(...args);
    };
    
    /**
     * crossbrowser create event
     *
     * @param eventName
     * @param keyCode - not necessarily
     */
    this.create = function(eventName, keyCode) {
        const event = document.createEvent('Event');
        
        event.initEvent(eventName, true, true);
        
        if (keyCode)
            event.keyCode = keyCode;
        
        event.isDefaultPrevented = function() {
            return this.defaultPrevented;
        };
        
        return event;
    };
    
    /**
     * create keydown event
     *
     * @param keyCode
     */
    this.createKey = function(keyCode) {
        return this.create('keydown', keyCode);
    };
    
    /**
     * create click event
     */
    this.createClick = function() {
        return this.create('click');
    };
    
    /**
     * create click event
     */
    this.createDblClick = function() {
        return this.create('dblclick');
    };
    
    /**
     * dispatch event
     *
     * @param event
     */
    this.dispatch = (event, element) => {
        let customEvent;
        const isStr = itype.string(event);
        
        if (isStr)
            customEvent = Events.create(event);
        else
            customEvent = event;
        
        return (element || window).dispatchEvent(customEvent);
    };
    
    /**
     * dispatch keydown event
     *
     * @param keyCode
     * @param element
     */
    this.dispatchKey = function(keyCode, element) {
        const event = this.createKey(keyCode);
        return this.dispatch(event, element);
    };
    
    /**
     * dispatch click event
     *
     * @param element
     */
    this.dispatchClick = function(element) {
        const event = this.createClick();
        return this.dispatch(event, element);
    };
    
    /**
     * dispatch dblclick event
     *
     * @param element
     */
    this.dispatchDblClick = function(element) {
        const event = this.createDblClick();
        
        return this.dispatch(event, element);
    };
    
    function checkType(type) {
        if (!type)
            throw Error('type could not be empty!');
    }
}

