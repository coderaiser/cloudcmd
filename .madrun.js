'use strict';

const {
    run,
    parallel,
    predefined,
} = require('madrun');

const {version} = require('./package');

const names = [
    'bin/cloudcmd.js',
    'client',
    'common',
    'server',
    'test',
    'bin/release.js',
    'webpack.config.js',
    'cssnano.config.js',
    '.webpack',
    '.eslintrc.js',
    '.madrun.js',
    '{client,server,common}/**/*.spec.js',
];

const {putout} = predefined;

const env = 'THREAD_IT_COUNT=0';

module.exports = {
    'start': () => 'node bin/cloudcmd.js',
    'start:dev': () => `NODE_ENV=development ${run('start')}`,
    'build:start': () => run(['build:client', 'start']),
    'build:start:dev': () => run(['build:client:dev', 'start:dev']),
    'lint:all': () => run(['lint', 'lint:css', 'spell']),
    'lint:base': () => putout({
        names,
    }),
    'lint:css': () => 'stylelint css/*.css',
    'spell': () => 'yaspeller .',
    'fix:lint': () => run(['lint', 'lint:css'], '--fix'),
    'lint': () => run('lint:progress'),
    'lint:progress': () => run('lint:base', '-f progress'),
    'lint:stream': () => run('lint:base', '-f stream'),
    
    'test:base': () => {
        const cmd = 'tape';
        const names = `'test/**/*.js' '{client,static,common,server}/**/*.spec.js'`;
        
        return `${cmd} ${names}`;
    },
    
    'test': () => `${env} ${run('test:base')}`,
    'test:client': () => `tape 'test/client/**/*.js'`,
    'test:server': () => `tape 'test/**/*.js' 'server/**/*.spec.js' 'common/**/*.spec.js'`,
    'wisdom': () => run(['lint:all', 'build', 'test']),
    'wisdom:type': () => 'bin/release.js',
    'docker:pull:node': () => 'docker pull node',
    'docker:pull:alpine': () => 'docker pull mhart/alpine-node',
    'docker:pull:arm32': () => 'docker pull arm32v7/node:slim',
    'docker:pull:arm64': () => 'docker pull arm64v8/node:slim',
    'docker:push': () => `docker push coderaiser/cloudcmd:${version}-x64`,
    'docker:push:latest': () => 'docker push coderaiser/cloudcmd:latest-x64',
    'docker:push:alpine': () => `docker push coderaiser/cloudcmd:${version}-alpine`,
    'docker:push:alpine:latest': () => 'docker push coderaiser/cloudcmd:latest-alpine',
    // ---- Following lines will be replaced by the line in the end, which does not compile yet!
    'docker:push:arm32': () => `docker push coderaiser/cloudcmd:${version}-arm32`,
    'docker:push:arm32:latest': () => 'docker push coderaiser/cloudcmd:latest-arm32',
    'docker:push:arm64': () => `docker push coderaiser/cloudcmd:${version}-arm64`,
    'docker:push:arm64:latest': () => 'docker push coderaiser/cloudcmd:latest-arm64',
    // ----
    'docker:build': () => `docker build -f docker/Dockerfile -t coderaiser/cloudcmd:${version}-x64 .`,
    'docker:build:alpine': () => `docker build -f docker/Dockerfile.alpine -t coderaiser/cloudcmd:${version}-alpine .`,
    'docker:build:arm32': () => `docker build -f docker/arm/Dockerfile.arm32v7 -t coderaiser/cloudcmd:${version}-arm32 .`,
    'docker:build:arm64': () => `docker build -f docker/arm/Dockerfile.arm64v8 -t coderaiser/cloudcmd:${version}-arm64 .`,
    'docker:manifest:create': () => 'docker manifest create coderaiser/cloudcmd:latest coderaiser/cloudcmd:latest-x64 coderaiser/cloudcmd:latest-arm32 coderaiser/cloudcmd:latest-arm64',
    'docker:manifest:push': () => 'docker manifest push coderaiser/cloudcmd:latest',
    'docker': () => run(['docker:pull*', 'docker:build*', 'docker:tag*', 'docker:push*']),
    'docker-ci': () => run(['build', 'docker-login', 'docker']),
    'docker-login': () => 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD',
    
    'docker:alpine': () => run([
        'docker:pull:alpine',
        'docker:build:alpine',
        'docker:tag:alpine',
        'docker:push:alpine',
        'docker:push:alpine:latest',
    ]),
    
    'docker:arm32': () => run([
        'docker:pull:arm32',
        'docker:build:arm32',
        'docker:tag:arm32',
        'docker:push:arm32',
        'docker:push:arm32:latest',
    ]),
    
    'docker:arm64': () => run([
        'docker:pull:arm64',
        'docker:build:arm64',
        'docker:tag:arm64',
        'docker:push:arm64',
        'docker:push:arm64:latest',
    ]),
    
    'docker:manifest': () => run([
        'docker:manifest:create',
        'docker:manifest:push',
    ]),
    
    'docker:tag': () => `docker tag coderaiser/cloudcmd:${version}-x64 coderaiser/cloudcmd:latest-x64`,
    'docker:tag:alpine': () => `docker tag coderaiser/cloudcmd:${version}-alpine coderaiser/cloudcmd:latest-alpine`,
    'docker:tag:arm32': () => `docker tag coderaiser/cloudcmd:${version}-arm32 coderaiser/cloudcmd:latest-arm32`,
    'docker:tag:arm64': () => `docker tag coderaiser/cloudcmd:${version}-arm64 coderaiser/cloudcmd:latest-arm64`,
    'docker:rm:version': () => `docker rmi -f coderaiser/cloudcmd:${version}-x64`,
    'docker:rm:latest': () => 'docker rmi -f coderaiser/cloudcmd:latest-x64',
    'docker:rm:alpine': () => `docker rmi -f coderaiser/cloudcmd:${version}-alpine`,
    'docker:rm:latest-alpine': () => 'docker rmi -f coderaiser/cloudcmd:latest-alpine',
    'docker:rm:arm32': () => `docker rmi -f coderaiser/cloudcmd:${version}-arm32`,
    'docker:rm:latest-arm32': () => 'docker rmi -f coderaiser/cloudcmd:latest-arm32',
    'docker:rm:arm64': () => `docker rmi -f coderaiser/cloudcmd:${version}-arm64`,
    'docker:rm:latest-arm64': () => 'docker rmi -f coderaiser/cloudcmd:latest-arm64',
    'docker:rm-old': () => `${parallel('docker:rm:*')} || true`,
    'coverage': () => `${env} nyc ${run('test:base')}`,
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    '6to5': () => 'webpack --progress',
    '6to5:client': () => run('6to5', '--mode production'),
    '6to5:client:dev': () => `NODE_ENV=development ${run('6to5', '--mode development')}`,
    'pre6to5:client': () => 'rimraf dist',
    'pre6to5:client:dev': () => 'rimraf dist-dev',
    'watch:client': () => run('6to5:client', '--watch'),
    'watch:client:dev': () => run('6to5:client:dev', '--watch'),
    'watch:server': () => 'nodemon bin/cloudcmd.js',
    'watch:lint': () => `nodemon -w client -w server -w webpack.config.js -x ${run('lint')}`,
    'watch:test': () => `nodemon -w client -w server -w test -w common -x ${run('test')}`,
    'watch:test:client': () => `nodemon -w client -w test/client -x ${run('test:client')}`,
    'watch:test:server': () => `nodemon -w client -w test/client -x ${run('test:server')}`,
    'watch:coverage': () => `nodemon -w server -w test -w common -x ${run('coverage')}`,
    'build': () => run('6to5:*'),
    'build:client': () => run('6to5:client'),
    'build:client:dev': () => run('6to5:client:dev'),
    'heroku-postbuild': () => run('6to5:client'),
};

// ---- This does not compile!
// function dockerPush(type, version = 'latest') {
//     return `docker push coderaiser/cloudcmd:${version}-${type}`;
// }

// module.exports = {
//     'docker:push:arm32': () => dockerPush('arm32', version),
//     'docker:push:arm32:latest': () => dockerPush('arm32'),
//     'docker:push:arm64': () => dockerPush('arm64', version),
//     'docker:push:arm64:latest': () => dockerPush('arm64'),
// };
// ----