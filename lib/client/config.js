var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Config = ConfigProto;
        
    function ConfigProto() {
        var Loading     = true,
            Key         = CloudCmd.Key,
            Images      = DOM.Images,
            Events      = DOM.Events,
            showLoad    = Images.showLoad.bind(DOM, {
                top: true
            }),
            Element,
            INPUT       = 'INPUT',
            CONFIG,
            Template,
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
                },
                Config.show
            ]);
        }
        
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
                data    = Util.render(Template, obj);
                div     = DOM.load({
                    name        : 'div',
                    className   : 'config',
                    inner       : data,
                    attribute   : {
                        'data-name': 'js-config'
                    }
                });
                
                Element = div;
                
                inputs      = DOM.getByTag(INPUT, div);
                inputFirst  = inputs[0];
                
                if (inputFirst) {
                    onAuthChange(inputFirst.checked);
                    
                    focus   = function() {
                        inputFirst.focus();
                    };
                }
                
                Util.forEach(inputs, function(input) {
                    Events.add('change', input, onChange)
                          .addKey(input, onKey)
                          .addClick(input, function(event) {
                              event.preventDefault();
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
            Object.keys(config).forEach(function(name) {
                var item    = config[name],
                    isBool  = Util.type.boolean(item);
                
                if (isBool)
                    config[name] = setState(item);
            });
        }
        
        function setState(state) {
            var ret = '';
            
            if (state)
                ret = ' checked';
            
            return ret;
        }
        
        function onChange(event) {
            var data,
                Config  = DOM.RESTful.Config,
                obj     = {},
                el      = event.target,
                name    = el.id,
                type    = el.type;
            
            obj[name]   = 
            data        = getValue(el);
            
            if (type === 'checkbox')
                if (el.id === 'localStorage')
                    onLocalStorageChange(data);
                else if (el.id === 'diff')
                    onLSChange(data);
                else if (el.id === 'buffer')
                    onLSChange(data);
                else if (el.id === 'dirStorage')
                    onLSChange(data);
                else if (el.id === 'auth')
                    onAuthChange(data);
            
            if (name === 'notifications') {
                if (data && !Notify.check())
                    Notify.request();
            }
            
            Config.write(obj, function() {
                CONFIG[name] = data;
                DOM.Files.set('config', CONFIG);
                setValue(el, data);
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
                data = el.value - 0;
                break;
            default:
                data = el.value;
                break;
            }
            
            return data;
        }
        
        function setValue(el, value) {
            var type    = el.type;
            
            switch(type) {
            case 'checkbox':
                el.checked = value;
                break;
            
            default:
                el.value    = value;
                break;
            }
        }
        
        function onLocalStorageChange(checked) {
            var elDiff          = DOM.getById('diff', Element),
                elBuffer        = DOM.getById('buffer', Element),
                elDirStorage    = DOM.getById('dirStorage', Element),
                isChecked       = elDiff.checked || elBuffer.checked || elDirStorage.checked,
                msg             = 'Diff, Buffer and Directory Storage do not work without localStorage';
            
            if (!checked && isChecked) {
                alert(msg);
                
                elDiff.checked          =
                elBuffer.checked        =
                elDirStorage.checked   = false;
                
                onChange({
                    target: elDiff
                });
                
                onChange({
                    target: elBuffer
                });
            }
        }
        
        function onLSChange(checked) {
            var element = DOM.getById('localStorage', Element);
            
            if (!element.checked && checked) {
                onLocalStorageChange(element.checked);
            }
            
            return element.checked;
        }
        
        function onAuthChange(checked) {
            var elUsername      = DOM.getById('username', Element),
                elPassword      = DOM.getById('password', Element);
            
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
