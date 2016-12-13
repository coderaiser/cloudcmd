var CloudCmd, Util, DOM, io;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    /* global rendy */
    /* global input */
    
    CloudCmd.Config = ConfigProto;
        
    function ConfigProto() {
        var Loading     = true,
            Key         = CloudCmd.Key,
            Dialog      = DOM.Dialog,
            Images      = DOM.Images,
            Events      = DOM.Events,
            Files       = DOM.Files,
            
            showLoad    = function() {
                Images.show.load('top');
            },
            
            Element,
            Template,
            
            TITLE       = 'Config',
            
            Notify      = DOM.Notify,
            Config      = this;
            
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
                prefix          = CloudCmd.PREFIX,
                FIVE_SECONDS    = 5000,
                save    = function(data) {
                    socket.send(data);
                };
                
            if (!error) {
                socket  = io.connect(href + prefix + '/config', {
                    'max reconnection attempts' : Math.pow(2, 32),
                    'reconnection limit'        : FIVE_SECONDS,
                    path: prefix + '/socket.io'
                });
                
                auth(socket, function() {
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
                        Dialog.alert(TITLE, error);
                    });
                });
            }
        }
        
        function auth(socket) {
            Files.get('config', function(error, config) {
                if (error)
                    return Dialog.alert(TITLE, error);
                
                if (config.auth) {
                    socket.emit('auth', config.username, config.password);
                    
                    socket.on('reject', function() {
                        Dialog.alert(TITLE, 'Wrong credentials!');
                    });
                }
            });
        }
        
        Config.save             = saveHttp;
        
        this.show               = function() {
            var prefix  = CloudCmd.PREFIX,
                exec    = Util.exec,
                funcs   = [
                    exec.with(Files.get, 'config-tmpl'),
                    exec.with(DOM.load.parallel, [
                        prefix + '/css/config.css',
                        prefix + CloudCmd.LIBDIRCLIENT + '/input.js'
                    ])
                ];
            
            if (!Loading) {
                showLoad();
                exec.parallel(funcs, fillTemplate);
            }
        };
        
        function fillTemplate(error, template) {
            if (!Template)
                Template = template;
            
            Files.get('config', function(error, config) {
                var data, inputs, inputFirst,
                    focus, obj;
                
                if (error)
                    return Dialog.alert(TITLE, 'Could not load config!');
                
                obj = input.convert(config);
                
                obj[obj.editor + '-selected'] = 'selected';
                delete obj.editor;
                
                obj[obj.packer + '-selected'] = 'selected';
                delete obj.packer;
                
                data    = rendy(Template, obj);
                Element = DOM.load({
                    name        : 'div',
                    className   : 'config',
                    inner       : data,
                    attribute   : {
                        'data-name': 'js-config'
                    }
                });
                
                inputs      = document.querySelectorAll('input, select', Element);
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
                
                CloudCmd.View.show(Element, {
                    autoSize: true,
                    afterShow: focus
                });
            });
        }
        
        this.hide               = function() {
            CloudCmd.View.hide();
        };
        
        function onChange(el) {
            var obj     = {},
                name    = input.getName(el),
                data    = input.getValue(name, Element),
                type    = el.type;
            
            if (type === 'checkbox')
                if (/^(diff|buffer|dirStorage)$/.test(name))
                    onLSChange(name, data);
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
                
                input.setValue(name, data, Element);
            });
            
            DOM.Storage.setAllowed(obj.localStorage);
        }
        
        function saveHttp(obj) {
            var RESTful = DOM.RESTful;
            
            RESTful.Config.write(obj, function(error) {
                if (!error)
                    onSave(obj);
            });
        }
        
        function onLocalStorageChange() {
            var names           = ['diff', 'buffer', 'dirStorage', 'localStorage'],
                elements        = names.map(function(name) {
                    return input.getElementByName(name, Element);
                }),
                
                el              = {},
                msg             = 'Diff, Buffer and Directory Storage do not work without localStorage',
                isChecked;
                
            elements.forEach(function(element) {
                var name    = input.getName(element);
                
                el[name]    = element;
                
                if (element.checked)
                    isChecked = true;
            });
            
            if (isChecked && !el.localStorage.checked) {
                Dialog.alert(TITLE, msg);
                
                elements.forEach(function(element) {
                    if (element.checked) {
                        element.checked = false;
                        
                        onChange(element);
                    }
                    
                    return element;
                });
            }
        }
        
        function onLSChange(name, data) {
            var elLocalStorage  = input.getElementByName('localStorage', Element),
                
                msg             = name + ' depends on localStorage';
            
            if (data && !elLocalStorage.checked) {
                Dialog.alert(TITLE, msg);
                elLocalStorage.checked = true;
            }
        }
        
        function onAuthChange(checked) {
            var elUsername      = input.getElementByName('username', Element),
                elPassword      = input.getElementByName('password', Element);
            
            elUsername.disabled =
            elPassword.disabled = !checked;
        }
        
        function onKey(event) {
            var keyCode = event.keyCode;
            
            switch (keyCode) {
            case Key.ESC:
                Config.hide();
                break;
            
            case Key.ENTER:
                onChange(event.target);
                break;
            }
        }
        
        DOM.Files.get('config', function(error, config) {
            if (error)
                return Dialog.alert(TITLE, error);
            
            if (!config.configDialog)
                return;
            
            init();
        });
    }
    
})(CloudCmd, Util, DOM);

