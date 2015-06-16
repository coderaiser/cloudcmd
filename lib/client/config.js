var CloudCmd, Util, DOM, io;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    /* global rendy */
    
    CloudCmd.Config = ConfigProto;
        
    function ConfigProto() {
        var Loading     = true,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            Events      = DOM.Events,
            showLoad    = function() {
                Images.show.load('top');
            },
            Element,
            CONFIG,
            Template,
            Notify      = DOM.Notify,
            Config      = this,
            
            getByData   = function(selector) {
                var el = DOM.getByDataName('js-' + selector, Element);
                
                return el;
            },
            
            getName     = function(element) {
                var name = element
                    .getAttribute('data-name')
                    .replace(/^js-/, '');
                
                return name;
            };
            
        function init() {
            Loading     = true;
            
            showLoad();
            Util.exec.series([
                CloudCmd.View,
                function(callback) {
                    Loading = false;
                    Util.exec(callback);
                    DOM.loadSocket(initSocket);
                },
                Config.show
            ]);
        }
        
        function getHost() {
            var l       = location,
                href    = l.origin || l.protocol + '//' + l.host;
            
            return href;
        }
        
        function initSocket(error) {
            var socket,
                href            = getHost(),
                FIVE_SECONDS    = 5000,
                save    = function(data) {
                    socket.send(data);
                };
                
            if (!error) {
                socket  = io.connect(href + '/config', {
                    'max reconnection attempts' : Math.pow(2, 32),
                    'reconnection limit'        : FIVE_SECONDS
                });
                
                socket.on('connect', function() {
                    Config.save = save;
                });
                
                socket.on('config', function(config) {
                    DOM.Storage.setAllowed(config.localStorage);
                });
                
                socket.on('message', function(data) {
                    onSave(data);
                });
                
                socket.on('log', function(msg) {
                    CloudCmd.log(msg);
                });
                
                socket.on('disconnect', function() {
                    Config.save = saveHttp;
                });
                
                socket.on('err', function(error) {
                    DOM.Dialog.alert(error);
                });
            }
        }
        
        Config.save             = saveHttp;
        
        this.show               = function() {
            var prefix  = CloudCmd.PREFIX,
                exec    = Util.exec,
                funcs   = [
                    exec.with(DOM.Files.get, 'config-tmpl'),
                    exec.with(DOM.load.css, prefix + '/css/config.css')
                ];
            
            if (!Loading) {
                showLoad();
                exec.parallel(funcs, fillTemplate);
            }
        };
        
        function fillTemplate(error, template) {
            if (!Template)
                Template = template;
            
            DOM.Files.get('config', function(error, config) {
                var div, data, inputs, inputFirst,
                    focus, obj;
                
                CONFIG  = config;
                obj     = Util.copyObj(CONFIG);
                changeConfig(obj);
                
                obj[obj.editor + '-selected'] = 'selected';
                delete obj.editor;
                
                data    = rendy(Template, obj);
                div     = DOM.load({
                    name        : 'div',
                    className   : 'config',
                    inner       : data,
                    attribute   : {
                        'data-name': 'js-config'
                    }
                });
                
                Element = div;
                
                inputs      = document.querySelectorAll('input, select', div);
                inputFirst  = inputs[0];
                
                if (inputFirst) {
                    onAuthChange(inputFirst.checked);
                    
                    focus   = function() {
                        inputFirst.focus();
                    };
                }
                
                [].forEach.call(inputs, function(input) {
                    Events.addKey(input, onKey)
                          .add('change', input, function(event) {
                              onChange(event.target);
                          });
                });
                
                CloudCmd.View.show(div, {
                    autoSize: true,
                    afterShow: focus
                });
            });
        }
        
        this.hide               = function() {
            CloudCmd.View.hide();
        };
        
        function changeConfig(config) {
            var array = Object.keys(config);
            
            mapCondition(array, function(name) {
                var type    = typeof config[name],
                    is      = type === 'boolean';
                
                return is;
            }).forEach(function(name) {
                var item = config[name];
                
                config[name] = setState(item);
            });
        }
        
        function mapCondition(array, fn) {
            var result = [];
            
            array.forEach(function(item) {
                var is = fn(item);
                
                if (is)
                    result.push(item);
            });
            
            return result;
        }
        
        function setState(state) {
            var ret = '';
            
            if (state)
                ret = ' checked';
            
            return ret;
        }
        
        function onChange(el) {
            var data,
                obj     = {},
                name    = getName(el),
                type    = el.type;
            
            data        = getValue(el);
            
            if (type === 'checkbox')
                if (/^(diff|buffer|dirStorage)$/.test(name))
                    onLSChange(el);
                else if (name === 'localStorage')
                    onLocalStorageChange();
                else if (name === 'auth')
                    onAuthChange(data);
            
            if (name === 'notifications') {
                if (data && !Notify.check())
                    Notify.request();
            }
            
            obj[name] = data;
            
            Config.save(obj);
        }
        
        function onSave(obj) {
            Object.keys(obj).forEach(function(name) {
                var data = obj[name];
                
                CONFIG[name] = data;
                setValue(name, data);
            });
            
            DOM.Storage.setAllowed(obj.localStorage);
        }
        
        function saveHttp(obj) {
            var RESTful = DOM.RESTful;
            
            RESTful.Config.write(obj, function() {
                onSave(obj);
            });
        }
        
        function getValue(el) {
            var data,
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
        
        function setValue(name, value) {
            var el      = getByData(name),
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
        
        function onLocalStorageChange() {
            var names           = ['diff', 'buffer', 'dirStorage', 'localStorage'],
                elements        = names.map(function(name) {
                    return getByData(name);
                }),
                
                el              = {},
                msg             = 'Diff, Buffer and Directory Storage do not work without localStorage',
                isChecked;
                
            elements.forEach(function(element) {
                var name    = getName(element);
                
                el[name]    = element;
                
                if (element.checked)
                    isChecked = true;
            });
            
            if (isChecked && !el.localStorage.checked) {
                alert(msg);
                
                elements.forEach(function(element) {
                    if (element.checked) {
                        element.checked = false;
                        
                        onChange(element);
                    }
                    
                    return element;
                });
            }
        }
        
        function onLSChange(el) {
            var elLocalStorage  = getByData('localStorage'),
                name            = el
                    .getAttribute('data-name')
                    .replace(/^js-/, ''),
                
                msg             = name + ' depends on localStorage';
            
            if (el.checked && !elLocalStorage.checked) {
                alert(msg);
                elLocalStorage.checked = true;
            }
        }
        
        function onAuthChange(checked) {
            var elUsername      = getByData('username'),
                elPassword      = getByData('password');
            
            elUsername.disabled =
            elPassword.disabled = !checked;
        }
        
        function onKey(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                Config.hide();
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);
