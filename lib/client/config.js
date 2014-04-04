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
            INPUT       = 'INPUT',
            CONFIG,
            Template,
            Notify      = DOM.Notify,
            Config      = this;
            
        function init() {
            Loading     = true;
            
            showLoad();
            Util.loadOnLoad([
                CloudCmd.View,
                function(callback) {
                    Loading = false;
                    Util.exec(callback);
                },
                Config.show
            ]);
        }
        
        this.show               = function() {
            var funcs = [
                Util.bind(CloudCmd.getTemplate, Template, 'config'),
                cssLoad
            ];
            
            if (!Loading) {
                showLoad();
                Util.asyncCall(funcs, fillTemplate);
            }
        };
        
        function cssLoad(callback) {
            DOM.cssLoad({
                src : '/css/config.css',
                func: Util.retExec(callback)
            });
        }
        
        function fillTemplate(template) {
            if (!Template)
                Template = template;
            
            CloudCmd.getConfig(function(config) {
                var i, n, div, data, inputs, input, inputFirst, 
                    focus, obj;
                
                CONFIG  = config;
                obj     = Util.copyObj(CONFIG);
                changeConfig(obj);
                data    = Util.render(Template, obj);
                div     = DOM.anyload({
                    name        : 'div',
                    className   : 'config',
                    inner       : data.toString()
                });
                
                inputs      = DOM.getByTag(INPUT, div);
                inputFirst  = inputs[0];
                
                if (inputFirst)
                    focus   = inputFirst.focus.bind(inputFirst);
                
                n           = inputs.length;
                for (i = 0; i < n; i++) {
                    input = inputs[i];
                    Events.add('change', onChange, input);
                    Events.addKey(key, input);
                }
                
                CloudCmd.View.show(div, focus, {
                    autoSize: true
                });
            });
        }
        
        this.hide               = function() {
            CloudCmd.View.hide();
        };
        
        
        function changeConfig(config) {
            var name;
            
            for (name in config)
                if (Util.isBoolean(config[name]))
                    config[name] = setState(config[name]);
        }
        
        function setState(state) {
            var ret = "";
            
            if (state)
                ret = " checked";
            
            return ret;
        }
        
        function onChange(event) {
            var data,
                obj     = {},
                el      = event.target,
                name    = el.id,
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
            
            obj[name] = data;
            
            if (name === 'notifications') {
                if (data && !Notify.check())
                    Notify.request();
            }
            
            CONFIG[name] = data;
            CloudCmd.setConfig(CONFIG);
            
            DOM.RESTful.config(obj);
        }
        
        function key(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                Config.hide();
        }
        
        init();
    }
    
})(CloudCmd, Util, DOM);
