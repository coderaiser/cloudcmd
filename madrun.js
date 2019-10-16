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
    'madrun.js',
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
    'lint:base': () => putout(names),
    'lint:css': () => 'stylelint css/*.css',
    'spell': () => 'yaspeller .',
    'fix:lint': () => run(['lint', 'lint:css'], '--fix'),
    'lint': () => run('lint:progress'),
    'lint:progress': () => run('lint:base', '-f progress'),
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
    'docker:push': () => `docker push coderaiser/cloudcmd:${version}`,
    'docker:push:latest': () => 'docker push coderaiser/cloudcmd:latest',
    'docker:push:alpine': () => `docker push coderaiser/cloudcmd:${version}-alpine`,
    'docker:push:alpine:latest': () => 'docker push coderaiser/cloudcmd:latest-alpine',
    'docker:build': () => `docker build -t coderaiser/cloudcmd:${version} .`,
    'docker:build:alpine': () => `docker build -f Dockerfile.alpine -t coderaiser/cloudcmd:${version}-alpine .`,
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
    'docker:tag': () => `docker tag coderaiser/cloudcmd:${version} coderaiser/cloudcmd:latest`,
    'docker:tag:alpine': () => `docker tag coderaiser/cloudcmd:${version}-alpine coderaiser/cloudcmd:latest-alpine`,
    'docker:rm:version': () => `docker rmi -f coderaiser/cloudcmd:${version}`,
    'docker:rm:latest': () => 'docker rmi -f coderaiser/cloudcmd:latest',
    'docker:rm:alpine': () => `docker rmi -f coderaiser/cloudcmd:${version}-alpine`,
    'docker:rm:latest-alpine': () => 'docker rmi -f coderaiser/cloudcmd:latest-alpine',
    'docker:rm-old': () => `${parallel('docker:rm:*')} || true`,
    'coverage': () => `${env} nyc ${run('test:base')}`,
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
    '6to5': () => 'webpack --progress',
    '6to5:client': () => run('6to5', '--mode production'),
    '6to5:client:dev': () => `NODE_ENV=development ${run('6to5', '--mode development')}`,
    'pre6to5:client': () => 'rimraf dist',
    'pre6to5:client:dev': () => 'rimraf dist-dev',
    'watch:client': () => run('6to5:client','--watch'),
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
    'putout': () => 'putout bin client static server common test .cloudcmd.menu.js',
};
