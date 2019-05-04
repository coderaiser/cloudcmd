'use strict';

/* global CloudCmd */

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');

CloudCmd.Markdown = exports;

const createElement = require('@cloudcmd/create-element');

const Images = require('../dom/images');
const {Markdown} = require('../dom/rest');
const {alert} = require('../dom/dialog');

const read = promisify(Markdown.read);

module.exports.init = async () => {
    Images.show.load('top');
    await CloudCmd.View();
};

module.exports.show = show;

module.exports.hide = () => {
    CloudCmd.View.hide();
};

async function show(name, options = {}) {
    const relativeQuery = '?relative';
    const {
        positionLoad,
        relative,
    } = options;
    
    Images.show.load(positionLoad);
    
    if (relative)
        name += relativeQuery;
    
    const [error, innerHTML] = await tryToCatch(read, name);
    Images.hide();
    
    if (error)
        return alert(error.message, {
            cancel: false,
        });
    
    const className = 'help';
    const div = createElement('div', {
        className,
        innerHTML,
    });
    
    CloudCmd.View.show(div);
}

