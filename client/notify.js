/* global CloudCmd */

'use strict';

const Events = require('./events');

let Show;

Events.add({
    'blur': () => {
        Show = true;
    },
    'focus': () => {
        Show = false;
    }
});

module.exports.send = (msg) => {
    const notifications = CloudCmd.config('notifications');
    const focus = window.focus.bind(window);
    const granted = check();
    
    if (!notifications || !granted || !Show)
        return;
    
    const notify = new Notification(msg, {
        icon: '/img/favicon/favicon-notify.png'
    });
     
    Events.addClick(notify, focus);
};

module.exports.check = check;

function check() {
    const Not = Notification;
    const perm = Not && Not.permission;
    
    return perm === 'granted';
}

module.exports.request = () => {
    if (Notification)
        Notification.requestPermission();
};

