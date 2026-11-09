import {branch} from '@putout/processor-html';

const VISIBLE = /\{\{\s*(config\w+)\s*\}\}/g;
const PLACEHOLDER = /\{\{\s*[\w-]+\s*\}\}/g;
const INPUT = /<input([^>]*?)\s*\/?>/g;

export const fromHbs = (template) => {
    const html = template
        .replace(VISIBLE, 'data-visible-by="$1"')
        .replace(PLACEHOLDER, '')
        .replace(INPUT, '<input$1/>');
    
    const [{source}] = branch(html);
    
    return source;
};
