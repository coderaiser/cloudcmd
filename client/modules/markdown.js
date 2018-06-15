'use strict';

/*global CloudCmd */

const Images = require('../dom/images');
const load = require('../dom/load');
const {Markdown} = require('../dom/rest');

module.exports.init = async () => {
    Images.show.load('top');
    await CloudCmd.View();
};

module.exports.show = show;

module.exports.hide = () => {
    CloudCmd.View.hide();
};


function show(name, options = {}) {
    const relativeQuery = '?relative';
    const {
        positionLoad,
        relative,
    } = options;
    
    Images.show.load(positionLoad);
    
    if (relative)
        name += relativeQuery;
    
    Markdown.read(name, (error, inner) => {
        const name = 'div';
        const className = 'help';
        
        const div = load({
            name,
            className,
            inner,
        });
        
        Images.hide();
        
        CloudCmd.View.show(div);
    });
}

