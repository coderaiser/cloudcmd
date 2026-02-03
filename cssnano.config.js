// used by OptimizeCssAssetsPlugin
import defaultPreset from 'cssnano-preset-default';

export default defaultPreset({
    svgo: {
        plugins: [{
            convertPathData: false,
        }, {
            convertShapeToPath: false,
        }],
    },
});
