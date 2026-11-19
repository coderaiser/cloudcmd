import {branch, merge} from '@putout/processor-html';

export const fromHtml = (template) => {
    const [{source}] = branch(template);
    
    return source;
};

export const toHtml = (code, template) => merge(template, [code]);

export const html = {
    from: fromHtml,
    to: toHtml,
};
