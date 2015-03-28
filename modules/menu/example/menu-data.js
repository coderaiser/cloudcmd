var menu, MenuIO;

(function() {
    'use strict';
    
    var element = document.querySelector('#js-menu-container'),
        options = {
            icon: true
        };
    
    menu = MenuIO(element, options, {
        'help': function() {
            console.log('*help');
        }
    });
})();
