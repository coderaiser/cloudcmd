import {readFileSync as nativeReadFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import tryCatch from 'try-catch';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const readTranslations = (lang, {readFileSync = nativeReadFileSync} = {}) => {
    const paths = [
        join(__dirname, '..', 'json', 'i18n', `${lang}.json`),
        join(__dirname, '..', 'json', 'i18n', 'en.json'),
    ];

    for (const dictPath of paths) {
        const [error, jsonString] = tryCatch(readFileSync, dictPath, 'utf8');
        
        if (!error && jsonString) {
            return JSON.parse(jsonString);
        }
    }

    return {};
};
