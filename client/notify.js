/* global Util */
/* global DOM */
/* global CloudCmd */

'use strict';

const Notify = Util.extendProto(NotifyProto);
const DOMProto = Object.getPrototypeOf(DOM);

Util.extend(DOMProto, {
    Notify
});

function NotifyProto() {
    var Events          = DOM.Events,
        Show,
        Notify          = this,
        Notification    = window.Notification;
    
    Events.add({
        'blur': () => {
            Show = true;
        },
        'focus': () => {
            Show = false;
        }
    });
    
    this.send = (msg) => {
        const notifications = CloudCmd.config('notifications');
        const focus = window.focus.bind(window);
        const granted = Notify.check();
        
        if (notifications && granted && Show) {
            const notify = new Notification(msg, {
                icon: '/img/favicon/favicon-notify.png'
            });
             
            Events.addClick(notify, focus);
        }
    };
    
    this.check = () => {
        const Not = Notification;
        const perm = Not && Not.permission;
        
        if (perm === 'granted')
            return true;
    };
    
    this.request = () => {
        if (Notification)
            Notification.requestPermission();
    };
}

