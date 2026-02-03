import {extname} from 'node:path';
import currify from 'currify';

export const isAudio = (name) => /\.(mp3|ogg|m4a)$/i.test(name);

const testRegExp = currify((name, reg) => reg.test(name));
const getRegExp = (ext) => RegExp(`\\.${ext}$`, 'i');

const isPDF = (a) => /\.pdf$/i.test(a);
const isHTML = (a) => a.endsWith('.html');
const isMarkdown = (a) => /.\.md$/.test(a);

export const getType = async (path) => {
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

export function isImage(name) {
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

function isVideo(name) {
    return /\.(mp4|avi|webm)$/i.test(name);
}

export const _detectType = detectType;

async function detectType(path) {
    const {headers} = await fetch(path, {
        method: 'HEAD',
    });
    
    for (const [name, value] of headers) {
        if (name === 'content-type')
            return `.${value
                .split('/')
                .pop()}`;
    }
    
    return '';
}
