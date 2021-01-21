'use strict';

// used by OptimizeCssAssetsPlugin

const defaultPreset = require('cssnano-preset-default');

module.exports = defaultPreset({
    svgo: {
        plugins: [{
            convertPathData: false,
        }, {
            convertShapeToPath: false,
        }],
    },
});

