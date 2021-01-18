import {createRequire} from 'module';
import {run, cutEnv} from 'madrun';

const require = createRequire(import.meta.url);

const testEnv = {
  THREAD_IT_COUNT: 0,
};

export default {
  'start': () => 'node bin/cloudcmd.mjs',
  'start:dev': async () => await run('start', null, {
    NODE_ENV: 'development',
  }),
  'build:start': () => run(['build:client', 'start']),
  'build:start:dev': () => run(['build:client:dev', 'start:dev']),
  'lint:all': () => run(['lint', 'spell']),
  'lint': () => 'putout .',
  'watch:lint': () => 'nodemon -w client -w server -w test -w common -w .webpack -x "putout -s"',
  'fresh:lint': () => run('lint', '--fresh'),
  'lint:fresh': () => run('lint', '--fresh'),
  'spell': () => 'yaspeller .',
  'fix:lint': () => run('lint', '--fix'),
  'lint:stream': () => run('lint', '-f stream'),
  'test': () => [testEnv, `tape 'test/**/*.js' '{client,static,common,server}/**/*.spec.js' -f fail`],
  'test:client': () => `tape 'test/client/**/*.js'`,
  'test:server': () => `tape 'test/**/*.js' 'server/**/*.spec.js' 'common/**/*.spec.js'`,
  'wisdom': () => run(['lint:all', 'build', 'test']),
  'wisdom:type': () => 'bin/release.mjs',
  'coverage': async () => [testEnv, `nyc ${await cutEnv('test')}`],
  'report': () => 'nyc report --reporter=text-lcov | coveralls',
  '6to5': () => 'webpack --progress',
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
  'build': () => run('6to5:*'),
  'build:client': () => run('6to5:client'),
  'build:client:dev': () => run('6to5:client:dev'),
  'heroku-postbuild': () => run('6to5:client'),
};
