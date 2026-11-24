import {readFileSync} from 'node:fs';
import test from 'supertape';
import {buildFromJSON} from '#common/cloudfunc';
import {files} from './fixture/build-from-json.js';

const read = (url) => readFileSync(new URL(url, import.meta.url), 'utf8');

const template = {
    pathLink: read('../tmpl/fs/pathLink.hbs'),
    path: read('../tmpl/fs/path.hbs'),
    file: read('../tmpl/fs/file.hbs'),
    link: read('../tmpl/fs/link.hbs'),
};

test('cloudfunc: buildFromJSON: golden: sort size desc', (t) => {
    const result = buildFromJSON({
        prefix: '',
        template,
        sort: 'size',
        order: 'desc',
        data: {
            path: '/etc/',
            files,
        },
    });
    
    const expected = read('./fixture/build-from-json-sort.html');
    
    t.equal(`${result}\n`, expected);
    t.end();
});

test('cloudfunc: buildFromJSON: golden: root', (t) => {
    const [directory, withoutFields] = [files[0], files[3]];
    
    const result = buildFromJSON({
        prefix: '/p',
        template,
        data: {
            path: '/',
            files: [directory, withoutFields],
        },
    });
    
    const expected = read('./fixture/build-from-json-root.html');
    
    t.equal(`${result}\n`, expected);
    t.end();
});

test('cloudfunc: buildFromJSON: showDotFiles: true', (t) => {
    const result = buildFromJSON({
        prefix: '',
        template,
        showDotFiles: true,
        data: {
            path: '/',
            files: [{
                name: '.git',
                type: 'directory',
            }],
        },
    });
    
    t.match(result, '>.git</a>');
    t.end();
});
