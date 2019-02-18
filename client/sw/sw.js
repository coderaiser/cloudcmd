'use strict';

const codegen = require('codegen.macro');
const tryToCatch = require('try-to-catch/legacy');
const currify = require('currify/legacy');

const isDev = process.env.NODE_ENV === 'development';

const isGet = (a) => a.method === 'GET';
const isBasic = (a) => a.type === 'basic';

const wait = currify((f, e) => e.waitUntil(f()));
const respondWith = currify((f, e) => {
    const {request} = e;
    const {url} = request;
    const pathname = getPathName(url);
    
    if (/\/$/.test(url) || /\^\/fs/.test(pathname))
        return;
    
    if (!isGet(request))
        return;
    
    if (!isBasic(request))
        return;
    
    if (/^\/api/.test(pathname))
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

self.addEventListener('install', wait(onInstall));
self.addEventListener('fetch', respondWith(onFetch));
self.addEventListener('activate', wait(onActivate));

async function onActivate() {
    console.info(`cloudcmd: sw: activate: ${NAME}`);
    
    await self.clients.claim();
    const keys = await caches.keys();
    const deleteCache = caches.delete.bind(caches);
    
    await Promise.all(keys.map(deleteCache));
}

async function onInstall() {
    console.info(`cloudcmd: sw: install: ${NAME}`);
    
    await self.skipWaiting();
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

