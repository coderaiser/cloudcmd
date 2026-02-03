import createMarkdownIt from 'markdown-it';

const markdownIt = createMarkdownIt();

export default (a) => markdownIt.render(a);
