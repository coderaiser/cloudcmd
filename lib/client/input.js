(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = InputProto();
    else
        global.input    = InputProto();
        
    function InputProto() {
        if (!(this instanceof InputProto))
            return new InputProto();
        
        this.setValue           = setValue;
        this.getValue           = getValue;
        this.convert            = convert;
        this.getName            = getName;
        this.getElementByName   = getElementByName;
        
        function getElementByName(selector, element) {
            var el = element.querySelector('[data-name="js-' + selector + '"]');
            
            return el;
        }
            
        function getName(element) {
            var name = element
                .getAttribute('data-name')
                .replace(/^js-/, '');
            
            return name;
        }
        
        function convert(config) {
            var result  = clone(config),
                array   = Object.keys(result),
                isBool  = partial(isType, result, 'boolean');
            
            array
                .filter(isBool)
                .forEach(function(name) {
                    var item = result[name];
                    
                    result[name] = setState(item);
                });
            
            return result;
        }
        
        function clone(object) {
            var result = {};
            
            Object.keys(object).forEach(function(name) {
                result[name] = object[name];
            });
            
            return result;
        }
        
        function partial(fn) {
            var i,
                bind    = Function.prototype.bind,
                n       = arguments.length,
                args    = Array(n - 1);
            
            args[0] = null;
            
            for (i = 1; i < n; i++)
                args[i] = arguments[i];
            
            return bind.apply(fn, args);
        }
        
        function isType(object, type, name) {
            var current = typeof object[name],
                is      = current === type;
            
            return is;
        }
        
        function setState(state) {
            var ret = '';
            
            if (state)
                ret = ' checked';
            
            return ret;
        }
        
        function getValue(name, element) {
            var data,
                el      = getElementByName(name, element),
                type    = el.type;
            
            switch(type) {
            case 'checkbox':
                data = el.checked;
                break;
            case 'number':
                data = Number(el.value);
                break;
            default:
                data = el.value;
                break;
            }
            
            return data;
        }
        
        function setValue(name, value, element) {
            var el      = getElementByName(name, element),
                type    = el.type;
            
            switch(type) {
            case 'checkbox':
                el.checked = value;
                break;
            
            default:
                el.value    = value;
                break;
            }
        }
    }
    
})(window);
