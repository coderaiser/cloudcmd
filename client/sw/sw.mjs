import process from 'node:process';
import codegen from 'codegen.macro';
import {tryToCatch} from 'try-to-catch';
import currify from 'currify';

const isDev = process.env.NODE_ENV === 'development';

const isGet = (a) => a.method === 'GET';
const isBasic = (a) => a.type === 'basic';

const wait = currify((f, e) => e.waitUntil(f()));
const respondWith = currify((f, e) => {
    const {request} = e;
    const {url} = request;
    const pathname = getPathName(url);
    
    if (url.endsWith('/') || /\^\/fs/.test(pathname))
        return;
    
    if (!isGet(request))
        return;
    
    if (!isBasic(request))
        return;
    
    if (pathname.startsWith('/api'))
        return;
    
    if (/^socket.io/.test(pathname))
        return;
    
    e.respondWith(f(e));
});

const getPathName = (url) => new URL(url).pathname;

const date = codegen`module.exports = '"' + Date() + '"'`;
const NAME = `cloudcmd: ${date}`;

const createRequest = (a) => new Request(a, {
    credentials: 'same-origin',
});

const getRequest = (a, request) => {
    if (a !== '/')
        return request;
    
    return createRequest('/');
};

globalThis.addEventListener('install', wait(onInstall));
globalThis.addEventListener('fetch', respondWith(onFetch));
globalThis.addEventListener('activate', wait(onActivate));

async function onActivate() {
    console.info(`cloudcmd: sw: activate: ${NAME}`);
    
    await globalThis.clients.claim();
    const keys = await caches.keys();
    const deleteCache = caches.delete.bind(caches);
    
    await Promise.all(keys.map(deleteCache));
}

async function onInstall() {
    console.info(`cloudcmd: sw: install: ${NAME}`);
    
    await globalThis.skipWaiting();
}

async function onFetch(event) {
    const {request} = event;
    const {url} = request;
    const pathname = getPathName(url);
    const newRequest = getRequest(pathname, event.request);
    
    const cache = await caches.open(NAME);
    const response = await cache.match(request);
    
    if (!isDev && response)
        return response;
    
    const [e, resp] = await tryToCatch(fetch, newRequest, {
        credentials: 'same-origin',
    });
    
    if (e)
        return new Response(e.message);
    
    await addToCache(request, resp.clone());
    
    return resp;
}

async function addToCache(request, response) {
    const cache = await caches.open(NAME);
    return cache.put(request, response);
}
