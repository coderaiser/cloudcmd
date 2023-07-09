import {
    run,
    cutEnv,
} from 'madrun';

const testEnv = {
    THREAD_IT_COUNT: 0,
};

const is17 = /^v1[789]/.test(process.version);
const is20 = /^v2/.test(process.version);

// fix for ERR_OSSL_EVP_UNSUPPORTED on node v17
// flag '--openssl-legacy-provider' not supported
// on earlier version of node.js
//
// https://stackoverflow.com/a/69746937/4536327
const buildEnv = (is17 || is20) && {
    NODE_OPTIONS: '--openssl-legacy-provider',
};

export default {
    'start': () => 'node bin/cloudcmd.mjs',
    'start:dev': async () => await run('start', null, {
        NODE_ENV: 'development',
    }),
    'build:start': () => run(['build:client', 'start']),
    'build:start:dev': () => run(['build:client:dev', 'start:dev']),
    'lint:all': () => run(['lint:progress', 'spell']),
    'lint': () => 'putout .',
    'lint:progress': () => run('lint', '-f progress'),
    'watch:lint': () => 'nodemon -w client -w server -w test -w common -w .webpack -x "putout -s"',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'spell': () => 'yaspeller . || true',
    'fix:lint': () => run('lint', '--fix'),
    'lint:stream': () => run('lint', '-f stream'),
    'test': () => [testEnv, `tape 'test/**/*.js' '{client,static,common,server}/**/*.spec.js' -f fail`],
    'test:client': () => `tape 'test/client/**/*.js'`,
    'test:server': () => `tape 'test/**/*.js' 'server/**/*.spec.js' 'common/**/*.spec.js'`,
    'wisdom': () => run(['lint:all', 'build', 'test']),
    'wisdom:type': () => 'bin/release.mjs',
    'coverage': async () => [testEnv, `c8 ${await cutEnv('test')}`],
    'coverage:report': () => 'c8 report --reporter=lcov',
    'report': () => 'c8 report --reporter=lcov',
    '6to5': () => [buildEnv, 'webpack --progress'],
    '6to5:client': () => run('6to5', '--mode production'),
    '6to5:client:dev': async () => await run('6to5', '--mode development', {
        NODE_ENV: 'development',
    }),
    'pre6to5:client': () => 'rimraf dist',
    'pre6to5:client:dev': () => 'rimraf dist-dev',
    'watch:client': () => run('6to5:client', '--watch'),
    'watch:client:dev': () => run('6to5:client:dev', '--watch'),
    'watch:server': () => 'nodemon bin/cloudcmd.js',
    'watch:test': async () => [testEnv, `nodemon -w client -w server -w test -w common -x ${await cutEnv('test')}`],
    'watch:test:client': async () => `nodemon -w client -w test/client -x ${await run('test:client')}`,
    'watch:test:server': async () => `nodemon -w client -w test/client -x ${await run('test:server')}`,
    'watch:coverage': async () => [testEnv, `nodemon -w server -w test -w common -x ${await cutEnv('coverage')}`],
    'build': async () => run('6to5:*'),
    'build:dev': async () => run('build:client:dev'),
    'build:client': () => run('6to5:client'),
    'build:client:dev': () => run('6to5:client:dev'),
    'heroku-postbuild': () => run('6to5:client'),
};
