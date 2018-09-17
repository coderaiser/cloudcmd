'use strict';

/* global CloudCmd */

CloudCmd.Markdown = exports;

const createElement = require('@cloudcmd/create-element');

const Images = require('../dom/images');
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
    
    Markdown.read(name, (error, innerHTML) => {
        const className = 'help';
        
        const div = createElement('div', {
            className,
            innerHTML,
        });
        
        Images.hide();
        CloudCmd.View.show(div);
    });
}

