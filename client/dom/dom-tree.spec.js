import {test, stub} from 'supertape';
import {create} from 'auto-globals';
import {tryCatch} from 'try-catch';
import {
    isContainClass,
    getByTag,
    getById,
    getByClass,
    getByDataName,
    getByClassAll,
    hide,
    show,
} from './dom-tree.js';

test('dom: isContainClass: no element', (t) => {
    const [e] = tryCatch(isContainClass);
    
    t.equal(e.message, 'element could not be empty!', 'should throw when no element');
    t.end();
});

test('dom: isContainClass: no className', (t) => {
    const [e] = tryCatch(isContainClass, {});
    
    t.equal(e.message, 'className could not be empty!', 'should throw when no element');
    t.end();
});

test('dom: isContainClass: contains', (t) => {
    const el = create();
    const {contains} = el.classList;
    
    const className = 'hello';
    isContainClass(el, className);
    
    t.calledWith(contains, [className], 'should call contains');
    t.end();
});

test('dom: isContainClass: contains: array', (t) => {
    const el = create();
    const {contains} = el.classList;
    
    const className = 'hello';
    isContainClass(el, ['world', className, 'hello']);
    
    t.calledWith(contains, [className], 'should call contains');
    t.end();
});

test('dom: getByTag', (t) => {
    const getElementsByTagName = stub();
    const element = {
        getElementsByTagName,
    };
    
    getByTag('div', element);
    
    t.calledWith(getElementsByTagName, ['div'], 'should call getElementsByTagName');
    t.end();
});

test('dom: getById', (t) => {
    const querySelector = stub();
    const element = {
        querySelector,
    };
    
    getById('my-id', element);
    
    t.calledWith(querySelector, ['#my-id'], 'should call querySelector with id selector');
    t.end();
});

test('dom: getByClassAll', (t) => {
    const getElementsByClassName = stub();
    const element = {
        getElementsByClassName,
    };
    
    getByClassAll('my-class', element);
    
    t.calledWith(getElementsByClassName, ['my-class'], 'should call getElementsByClassName');
    t.end();
});

test('dom: getByClass: calls getByClassAll', (t) => {
    const element = {
        getElementsByClassName: stub().returns(['first']),
    };
    
    const result = getByClass('my-class', element);
    
    t.equal(result, 'first', 'should return first element from class list');
    t.end();
});

test('dom: getByDataName', (t) => {
    const querySelector = stub();
    const element = {
        querySelector,
    };
    
    getByDataName('hello', element);
    
    t.calledWith(querySelector, ['[data-name="hello"]'], 'should call querySelector with data-name selector');
    t.end();
});

test('dom: hide', (t) => {
    const add = stub();
    const element = {
        classList: {
            add,
        },
    };
    
    hide(element);
    
    t.calledWith(add, ['hidden'], 'should add hidden class');
    t.end();
});

test('dom: show', (t) => {
    const remove = stub();
    const element = {
        classList: {
            remove,
        },
    };
    
    show(element);
    
    t.calledWith(remove, ['hidden'], 'should remove hidden class');
    t.end();
});

test('dom: getByClassAll: without element uses document', (t) => {
    const getElementsByClassName = stub();
    const prevDocument = globalThis.document;
    
    globalThis.document = {
        getElementsByClassName,
    };
    
    getByClassAll('my-class');
    
    globalThis.document = prevDocument;
    
    t.calledWith(getElementsByClassName, ['my-class'], 'should fallback to document when no element');
    t.end();
});
