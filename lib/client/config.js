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
            var exec    = Util.exec,
                funcs   = [
                    exec.with(DOM.Files.get, 'config-tmpl'),
                    exec.with(DOM.load.css, '/css/config.css')
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
                
                if (inputFirst)
                    focus   = function() {
                        inputFirst.focus();
                    };
                
                Util.forEach(inputs, function(input) {
                    Events.add('change', input, onChange)
                          .addKey(input, onKey);
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
                    isBool  = Util.isBoolean(item);
                
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
            
            switch(type) {
            case 'checkbox':
                data = el.checked;
                
                if (el.id === 'localStorage')
                    onLocalStorageChange(data);
                else if (el.id === 'diff')
                    onDiffChange(data);
                else if (el.id === 'buffer')
                    onBufferChange(data);
                
                break;
            case 'number':
                data = el.value - 0;
                break;
            default:
                data = el.value;
                break;
            }
            
            obj[name] = data;
            
            if (name === 'notifications') {
                if (data && !Notify.check())
                    Notify.request();
            }
            
            CONFIG[name] = data;
            
            DOM.Files.set('config', CONFIG, function() {
                Config.write(obj);
            });
        }
        
        function onLocalStorageChange(checked) {
            var elDiff    = DOM.getById('diff', Element),
                elBuffer  = DOM.getById('buffer', Element),
                msg     = 'Diff and Buffer do not work without localStorage';
            
            if (!checked && (elDiff.checked || elBuffer.checked)) {
                alert(msg);
                
                elDiff.checked      =
                elBuffer.checked    = false;
                
                onChange({
                    target: elDiff
                });
                
                onChange({
                    target: elBuffer
                });
            }
        }
        
        function onDiffChange(checked) {
            var element = DOM.getById('localStorage', Element);
            
            if (!element.checked && checked) {
                onLocalStorageChange(element.checked);
            }
            
            return element.checked;
        }
        
        function onBufferChange(checked) {
            var element = DOM.getById('localStorage', Element);
            
            if (!element.checked && checked) {
                onLocalStorageChange(element.checked);
            }
            
            return element.checked;
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
