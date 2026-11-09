export const pickRenderer = (name, {rendy, ...renderers}) => renderers[name] || rendy;
