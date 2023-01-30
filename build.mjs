âˆimport * as esbuild from 'esbuild'

const dir = './client';
const dirModules = './client/modules';

await esbuild.build({
  entryPoints: [
        `${dir}/cloudcmd.js`,
        `${dirModules}/edit.js`,
        `${dirModules}/edit-file.js`,
        `${dirModules}/edit-file-vim.js`,
        `${dirModules}/edit-names.js`,
        `${dirModules}/edit-names-vim.js`,
        `${dirModules}/menu.js`,
        `${dirModules}/view/index.js`,
        `${dirModules}/help.js`,
        `${dirModules}/markdown.js`,
        `${dirModules}/config/index.js`,
        `${dirModules}/contact.js`,
        `${dirModules}/upload.js`,
        `${dirModules}/operation/index.js`,
        `${dirModules}/konsole.js`,
        `${dirModules}/terminal.js`,
        `${dirModules}/terminal-run.js`,
        `${dirModules}/cloud.js`,
        `${dirModules}/user-menu/index.js`,
        `${dirModules}/polyfill.js`,
        `${dirModules}/command-line.js`,

        'css/columns/name-size-date.css',
        'css/columns/name-size.css',
  ],
  entryNames: '[dir]',
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['chrome100'],
  alias: {
    path: 'path-browserify',
  },
  outdir: 'dist',
    loader: {
      '.png': 'dataurl',
      '.gif': 'dataurl',
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.ttf': 'dataurl',
      '.eot': 'dataurl',
      '.svg': 'text',
    }
})
