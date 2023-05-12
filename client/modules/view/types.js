'use strict';

const {extname} = require('path');
const currify = require('currify');
const testRegExp = currify((name, reg) => reg.test(name));
const getRegExp = (ext) => RegExp(`\\.${ext}$`, 'i');

const isPDF = (a) => /\.pdf$/i.test(a);
const isHTML = (a) => /\.html$/.test(a);
const isMarkdown = (a) => /.\.md$/.test(a);

module.exports.getType = async (path) => {
    const ext = extname(path);
    
    if (!ext)
        path = await detectType(path);
    
    if (isPDF(path))
        return 'pdf';
    
    if (isImage(path))
        return 'image';
    
    if (isMedia(path))
        return 'media';
    
    if (isHTML(path))
        return 'html';
    
    if (isMarkdown(path))
        return 'markdown';
};

module.exports.isImage = isImage;
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

module.exports.isAudio = isAudio;
function isAudio(name) {
    return /\.(mp3|ogg|m4a)$/i.test(name);
}

function isVideo(name) {
    return /\.(mp4|avi|webm)$/i.test(name);
}

module.exports._detectType = detectType;
async function detectType(path) {
    const {headers} = await fetch(path, {
        method: 'HEAD',
    });
    
    for (const [name, value] of headers) {
        if (name === 'content-type')
            return `.${value.split('/').pop()}`;
    }
    
    return '';
}

