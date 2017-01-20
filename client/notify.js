/* global CloudCmd */
var Util, DOM;

(function(Util, DOM) {
    'use strict';
    
    var config = CloudCmd.config;
    var Notify = Util.extendProto(NotifyProto);
    var DOMProto = Object.getPrototypeOf(DOM);
    
    Util.extend(DOMProto, {
        Notify: Notify
    });
    
    function NotifyProto() {
        var Events          = DOM.Events,
            Show,
            Notify          = this,
            Notification    = window.Notification;
        
        Events.add({
            'blur': function() {
                Show = true;
            },
            'focus': function() {
                Show = false;
            }
        });
        
        this.send       = function(msg) {
            var notify,
                notifications   = config('notifications'),
                focus           = window.focus.bind(window),
                granted         = Notify.check();
            
            if (notifications && granted && Show) {
                notify = new Notification(msg, {
                    icon: '/img/favicon/favicon-notify.png'
                });
                 
                Events.addClick(notify, focus);
            }
        };
        
        this.check = function () {
            var ret,
                Not     = Notification,
                perm    = Not && Not.permission;
            
            if (perm === 'granted')
                ret = true;
            
            return ret;
        };
        
        this.request = function () {
            var Not = Notification;
            
            if (Not)
                Not.requestPermission();
        };
    }
})(Util, DOM);
