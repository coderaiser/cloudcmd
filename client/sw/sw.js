'use strict';

const preval = require('preval.macro');
const tryToCatch = require('try-to-catch/legacy');
const currify = require('currify/legacy');

const isDev = process.env.NODE_ENV === 'development';

const tryWrap = (a) => (...b) => tryToCatch(a, ...b);

const wait = currify((f, e) => e.waitUntil(f()));
const respondWith = currify((f, e) => e.respondWith(f(e)));
const getPathName = (url) => new URL(url).pathname;

const date = preval`module.exports = Date()`;
const NAME = `cloudcmd: ${date}`;

const isGet = (a) => a.method === 'GET';
const isBasic = (a) => a.type === 'basic';

const createRequest = (a) => new Request(a, {
    credentials: 'same-origin'
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
    
    const cache = await caches.open(NAME);
    
    const urls = [
        '/favicon.ico',
    ];
    
    const requests = urls.map(createRequest);
    return cache.addAll(requests);
}

async function onFetch(event) {
    const url = event.request.url;
    const pathname = getPathName(url);
    const request = getRequest(pathname, event.request);
    
    const cache = await caches.open(NAME);
    const response = await cache.match(request);
    
    if (!isDev && response)
        return response;
     
    const [e, resp] = await tryToRequest(request);
    
    if (e)
        return console.error(e, response, pathname);
    
    if (!isGet(request) || !resp.ok || !isBasic(resp))
        return resp;
    
    if (/\/$/.test(pathname))
        return resp;
    
    if (/^\/api/.test(pathname))
        return resp;
    
    if (/^socket.io/.test(pathname))
        return resp;
    
    await addToCache(request, resp.clone());
     
    return resp;
}

async function addToCache(request, response) {
    const cache = await caches.open(NAME);
    return cache.put(request, response);
}

async function tryToRequest(req) {
    const {url} = req;
    const path = url.replace(`${location.origin}/`, '');
    const get = tryWrap(fetch);
    const prefix = getPrefix();
    
    if (prefix && /^dist/.test(path))
        return await get(createRequest(`${prefix}${path}`));
    
    return await get(req.clone());
}

function getPrefix() {
    const {
        href,
        origin,
    } = location;
    
    const prefix = href
        .replace(origin, '')
        .replace('sw.js', '');
    
    return prefix;
}

