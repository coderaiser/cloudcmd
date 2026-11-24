const text = (value) => () => value;
const sorted = (getName, id) => getName(id);
const plain = (getName, id) => id;

export const getSize = ({size, type}) => {
    if (type === 'directory')
        return '&lt;dir&gt;';
    
    if (/link/.test(type))
        return '&lt;link&gt;';
    
    return size;
};

export const fields = [{
    id: 'name',
    header: sorted,
    value: (file, {link}) => link,
    dotDot: ({link}) => link,
}, {
    id: 'size',
    header: sorted,
    value: getSize,
    dotDot: text('&lt;dir&gt;'),
}, {
    id: 'time',
    header: sorted,
    value: ({time}) => time || '--:--:--',
    dotDot: text('--:--:--'),
}, {
    id: 'date',
    header: sorted,
    value: ({date}, {formatDate}) => formatDate(date || '--.--.----'),
    dotDot: text('--.--.----'),
}, {
    id: 'owner',
    header: plain,
    value: ({owner}) => owner || 'root',
    dotDot: text('.'),
}, {
    id: 'mode',
    header: plain,
    value: ({mode}) => mode,
    dotDot: text('--- --- ---'),
}];

const toValues = (pick) => Object.fromEntries(fields.map((field) => [field.id, pick(field)]));

export const getHeaderValues = (getName) => toValues(({id, header}) => header(getName, id));
export const getDotDotValues = (context) => toValues(({dotDot}) => dotDot(context));
export const getFileValues = (file, context) => toValues(({value}) => value(file, context));
