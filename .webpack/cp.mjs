import {cpSync} from 'node:fs';

cpSync('./css/columns', './dist-dev/columns', {
    recursive: true,
});

cpSync('./css/themes', './dist-dev/themes', {
    recursive: true,
});

cpSync('./css/columns', './dist/columns', {
    recursive: true,
});

cpSync('./css/themes', './dist/themes', {
    recursive: true,
});
