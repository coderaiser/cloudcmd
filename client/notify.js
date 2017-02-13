/* global CloudCmd */

'use strict';

const Events = require('./events');

module.exports = new Notify();

function Notify() {
    let Show;
    
    const Notify = this;
    const Notification = window.Notification;
    
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

