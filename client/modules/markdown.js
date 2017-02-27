'use strict';

/*global CloudCmd */

CloudCmd.Markdown = MarkdownProto;

const exec = require('execon');

const Images = require('../dom/images');
const load = require('../load');
const {Markdown} = require('../rest');

function MarkdownProto(name, options) {
    Images.show.load('top');
    
    exec.series([
        CloudCmd.View,
        exec.with(show, name, options),
    ]);
    
    return module.exports;
}

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

