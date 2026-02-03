export const report = () => `Use 'if condition' instead of 'ternary expression'`;

export const replace = () => ({
    'const test = autoGlobals(require("supertape"))': `{
        const {test: tape} = require('supertape');
        const test = autoGlobals(tape);
    }`,
});
