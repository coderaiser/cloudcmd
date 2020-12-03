'use strict';

const {
    run,
    parallel,
} = require('madrun');

const {version} = require('./package');

const env = 'THREAD_IT_COUNT=0';
const dockerName = 'coderaiser/cloudcmd';

module.exports = {
    'start': () => 'node bin/cloudcmd.js',
    'start:dev': () => `NODE_ENV=development ${run('start')}`,
    'build:start': () => run(['build:client', 'start']),
    'build:start:dev': () => run(['build:client:dev', 'start:dev']),
    'lint:all': () => run(['lint', 'lint:css', 'spell']),
    'lint': () => 'putout .',
    'lint:css': () => 'stylelint css/*.css',
    'spell': () => 'yaspeller .',
    'fix:lint': () => run(['lint', 'lint:css'], '--fix'),
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
    'docker:pull': () => 'docker pull node',
    'docker:pull:alpine': () => 'docker pull mhart/alpine-node',
    'docker:pull:arm32': () => 'docker pull arm32v7/node:slim',
    'docker:pull:arm64': () => 'docker pull arm64v8/node:slim',
    'docker:push': () => dockerPush('x64', version),
    'docker:push:latest': () => dockerPush('x64'),
    'docker:push:alpine': () => dockerPush('alpine', version),
    'docker:push:alpine:latest': () => dockerPush('alpine'),
    'docker:push:arm32': () => dockerPush('arm32', version),
    'docker:push:arm32:latest': () => dockerPush('arm32'),
    'docker:push:arm64': () => dockerPush('arm64', version),
    'docker:push:arm64:latest': () => dockerPush('arm64'),
    'docker:build': () => dockerBuild('docker/Dockerfile', 'x64', version),
    'docker:build:alpine': () => dockerBuild('docker/Dockerfile.alpine', 'alpine', version),
    'docker:build:arm32': () => dockerBuild('docker/arm/Dockerfile.arm32v7', 'arm32', version),
    'docker:build:arm64': () => dockerBuild('docker/arm/Dockerfile.arm64v8', 'arm64', version),
    'docker:manifest:create': () => {
        const images = [
            `${dockerName}:latest`,
            `${dockerName}:latest-x64`,
            // `${dockerName}:latest-arm32`,
            // `${dockerName}:latest-arm64`,
        ].join(' ');
        
        return `docker manifest create ${images}`;
    },
    'docker:manifest:push': () => `docker manifest push ${dockerName}:latest`,
    'docker': () => run(['docker:x64', 'docker:alpine', 'docker:manifest:*']),
    'docker-ci': () => run(['build', 'docker-login', 'docker']),
    'docker-login': () => 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD',
    
    'docker:x64': () => run([
        'docker:pull',
        'docker:build',
        'docker:tag',
        'docker:push',
        'docker:push:latest',
    ]),
    
    'docker:alpine': () => run([
        'docker:pull:alpine',
        'docker:build:alpine',
        'docker:tag:alpine',
        'docker:push:alpine',
        'docker:push:alpine:latest',
    ]),
    
    /*
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
    */
    
    'docker:manifest': () => run([
        'docker:manifest:create',
        'docker:manifest:push',
    ]),
    
    'docker:tag': () => dockerTag('x64', version),
    'docker:tag:alpine': () => dockerTag('alpine', version),
    'docker:tag:arm32': () => dockerTag('arm32', version),
    'docker:tag:arm64': () => dockerTag('arm64', version),
    'docker:rm:version': () => dockerRmi('x64', version),
    'docker:rm:latest': () => dockerRmi('x64'),
    'docker:rm:alpine': () => dockerRmi('alpine', version),
    'docker:rm:latest-alpine': () => dockerRmi('alpine'),
    'docker:rm:arm32': () => dockerRmi('arm32', version),
    'docker:rm:latest-arm32': () => dockerRmi('arm32'),
    'docker:rm:arm64': () => dockerRmi('arm64', version),
    'docker:rm:latest-arm64': () => dockerRmi('arm64'),
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

function dockerPush(type, version = 'latest') {
    return `docker push coderaiser/cloudcmd:${version}-${type}`;
}

function dockerBuild(file, type, version) {
    return `docker build -f ${file} -t coderaiser/cloudcmd:${version}-${type} .`;
}

function dockerTag(type, version) {
    return `docker tag coderaiser/cloudcmd:${version}-${type} coderaiser/cloudcmd:latest-${type}`;
}

function dockerRmi(type, version = 'latest') {
    return `docker rmi -f coderaiser/cloudcmd:${version}-${type}`;
}
