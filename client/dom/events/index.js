'use strict';

const itype = require('itype');
const EventStore = require('./event-store');

module.exports = new EventsProto();

function EventsProto() {
    const Events = this;
    
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
    
    /**
     * safe add event listener
     *
     * @param type
     * @param element - document by default
     * @param listener
     */
    this.add = (type, element, listener) => {
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
    this.addOnce = (type, element, listener) => {
        const once = (event) => {
            Events.remove(type, element, once);
            listener(event);
        };
        
        if (!listener) {
            listener = element;
            element = null;
        }
        
        this.add(type, element, once);
        
        return Events;
    };
    
    /**
     * safe remove event listener
     *
     * @param type
     * @param listener
     * @param element - document by default
     */
    this.remove = (type, element, listener) => {
        checkType(type);
        
        parseArgs(type, element, listener, (element, args) => {
            element.removeEventListener(...args);
        });
        
        return Events;
    };
    
    /**
     * remove all added event listeners
     */
    this.removeAll = () => {
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
    this.addKey = function(...args) {
        return Events.add('keydown', ...args);
    };
    
    /**
     * safe remove event click listener
     *
     * @param args
     */
    this.rmKey = function(...args) {
        return Events.remove('keydown', ...args);
    };
    
    /**
     * safe add event click listener
     */
    this.addClick = function(...args) {
        return Events.add('click', ...args);
    };
    
    /**
     * safe remove event click listener
     */
    this.rmClick = function(...args) {
        return Events.remove('click', ...args);
    };
    
    this.addContextMenu = function(...args) {
        return Events.add('contextmenu', ...args);
    };
    
    /**
     * safe add load listener
     */
    this.addLoad = function(...args) {
        return Events.add('load', ...args);
    };
    
    function checkType(type) {
        if (!type)
            throw Error('type could not be empty!');
    }
}
