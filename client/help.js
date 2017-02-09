'use strict';

/* global DOM, CloudCmd */

window.CloudCmd.Help = HelpProto;

function HelpProto() {
    const Images = DOM.Images;
    const Help = this;
    
    function init() {
        Images.show.load('top');
        Help.show();
    }
    
    this.show = () => {
        CloudCmd
            .Markdown
            .show('/HELP.md', {
                positionLoad    : 'top',
                relative        : true
            });
    };
    
    this.hide = () => {
        CloudCmd.View.hide();
    };
    
    init();
}

