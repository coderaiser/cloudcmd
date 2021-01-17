'use strict';

const currify = require('currify');
const testRegExp = currify((name, reg) => reg.test(name));
const getRegExp = (ext) => RegExp(`\\.${ext}$`, 'i');

const isPDF = (a) => /\.pdf$/i.test(a);
const isHTML = (a) => /\.html$/.test(a);
const isMarkdown = (a) => /.\.md$/.test(a);

module.exports = (name) => {
    if (isPDF(name))
        return 'pdf';
    
    if (isImage(name))
        return 'image';
    
    if (isMedia(name))
        return 'media';
    
    if (isHTML(name))
        return 'html';
    
    if (isMarkdown(name))
        return 'markdown';
};

function isImage(name) {
    const images = [
        'jp(e|g|eg)',
        'gif',
        'png',
        'bmp',
        'webp',
        'svg',
        'ico',
    ];
    
    return images
        .map(getRegExp)
        .some(testRegExp(name));
}

function isMedia(name) {
    return isAudio(name) || isVideo(name);
}

function isAudio(name) {
    return /\.(mp3|ogg|m4a)$/i.test(name);
}

function isVideo(name) {
    return /\.(mp4|avi|webm)$/i.test(name);
}
