var Util, DOM;

(function(Util, DOM) {
    'use strict';
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.Events = new EventsProto();
    
    function EventsProto() {
        var Events      = this,
            
            Type        = Util.type,
            check       = Util.check,
            
            parseArgs   = function(eventName, element, listener, callback) {
                var isFunc, isElement, error,
                    EVENT_NAME  = 0,
                    ELEMENT     = 1,
                    type        = Type(eventName);
                
                switch(type) {
                default:
                    isElement   = type.match('element');
                    
                    if (!isElement) {
                        error   = new Error('unknown eventName: ' + type);
                        throw(error);
                    } else {
                        eventName   = arguments[ELEMENT];
                        element     = arguments[EVENT_NAME];
                        
                       parseArgs(
                            eventName,
                            element,
                            listener,
                            callback
                        );
                    }
                    break;
                
                case 'string':
                    isFunc = Type.function(element);
                    
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
                    eventName.forEach(function(eventName) {
                        parseArgs(
                            eventName,
                            element,
                            listener,
                            callback
                        );
                    });
                    break;
                
                case 'object':
                    Object.keys(eventName).forEach(function(name) {
                        var eventListener = eventName[name];
                        
                        parseArgs(
                            name,
                            element,
                            eventListener,
                            callback
                        );
                    });
                        
                    break;
                }
            };
        
        /**
         * safe add event listener
         *
         * @param type
         * @param element {document by default}
         * @param listener
         */
        this.add                        = function(type, element, listener) {
            check(arguments, ['type']);
            
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
        this.addOnce                    = function(type, element, listener) {
            var once    = function (event) {
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
        this.remove                     = function(type, element, listener) {
            check(arguments, ['type']);
            
            parseArgs(type, element, listener, function(element, args) {
                element.removeEventListener.apply(element, args);
            });
            
            return Events;
        };
        
        /**
         * safe add event keydown listener
         *
         * @param listener
         */
        this.addKey                     = function() {
            var name    = 'keydown',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.add.apply(this, args);
        };
        
        /**
         * safe remove event click listener
         *
         * @param listener
         */
        this.rmKey                      = function() {
            var name    = 'keydown',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.remove.apply(this, args);
        };
        
        /**
         * safe add event click listener
         *
         * @param listener
         */
        this.addClick                   = function() {
            var name    = 'click',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.add.apply(this, args);
        };
        
        /**
         * safe remove event click listener
         *
         * @param listener
         */
        this.rmClick                   = function() {
            var name    = 'click',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.remove.apply(this, args);
        };
        
        this.addContextMenu             = function() {
            var name    = 'contextmenu',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.add.apply(this, args);
        };
        
        /**
         * safe add event click listener
         *
         * @param listener
         */
        this.addError                   = function() {
            var name    = 'error',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.add.apply(this, args);
        };
        
        /**
         * safe add load click listener
         *
         * @param listener
         */
        this.addLoad                   = function() {
            var name    = 'load',
                argsArr = [].slice.call(arguments),
                args    = [name].concat(argsArr);
            
            return this.add.apply(this, args);
        };
        
        /**
         * crossbrowser create event
         *
         * @param eventName
         * @param keyCode - not necessarily
         */
        this.create                     = function(eventName, keyCode) {
            var event = document.createEvent('Event');
            
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
        this.createKey                  = function(keyCode) {
            return this.create('keydown', keyCode);
        };
        
        /**
         * create click event
         *
         * @param pKeyCode
         */
        this.createClick                = function() {
            return this.create('click');
        };
        
        /**
         * create click event
         *
         * @param pKeyCode
         */
        this.createDblClick             = function() {
            return this.create('dblclick');
        };
        
        /**
         * dispatch event
         *
         * @param pEvent
         */
        this.dispatch                   = function(event, element) {
            var isStr   = Type.string(event);
            
            if (isStr)
                event   = Events.create(event);
            else
                event   = event;
            
            return (element || window).dispatchEvent(event);
        };
        
        /**
         * dispatch keydown event
         *
         * @param pKeyCode
         * @param element
         */
        this.dispatchKey                = function(keyCode, element) {
            var event  = this.createKey(keyCode),
                ret    = this.dispatch(event, element);
            
            return ret;
        };
        
        /**
         * dispatch click event
         *
         * @param element
         */
        this.dispatchClick              = function(element) {
            var event  = this.createClick(),
                ret    = this.dispatch(event, element);
            
            return ret;
        };
        
        /**
         * dispatch dblclick event
         *
         * @param element
         */
        this.dispatchDblClick           = function(element) {
            var event  = this.createDblClick(),
                ret    = this.dispatch(event, element);
            
            return ret;
        };
    }
})(Util, DOM);
