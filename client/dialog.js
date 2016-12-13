/* global DOM */
/* global smalltalk */

(function(DOM) {
    'use strict';
    
    DOM.Dialog = Dialog;
    
    function Dialog(prefix, config) {
        var self            = this;
        
        if (!(this instanceof Dialog))
            return new Dialog(config);
        
        load(config.htmlDialogs);
        
        function load(htmlDialogs) {
            var names,
                name        = 'smalltalk',
                is          = window.Promise,
                js          = '.min.js',
                jsName      = is ? js : '.poly' + js,
                dir         = '/modules/' + name + '/dist/';
            
            if (!htmlDialogs)
                jsName = '.native' + jsName;
            
            names = [jsName, '.min.css'].map(function(ext) {
                return prefix + dir + name + ext;
            });
            
            DOM.load.parallel(names, function() {});
        }
        
        this.alert          = function(title, message) {
            return smalltalk.alert(title, message);
        };
        
        this.prompt         = function(title, message, value, options) {
            return smalltalk.prompt(title, message, value, options);
        };
        
        this.confirm         = function(title, message, options) {
            return smalltalk.confirm(title, message, options);
        };
        
        this.alert.noFiles  = function(title) {
            return self.alert(title, 'No files selected!');
        };
    }
    
})(DOM);
