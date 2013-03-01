(function(w) {
if (w.fastXDM) return;

var handlers = {};
var onEnvLoad = [];
var env = {};

// Key generation
function genKey() {
  var key = '';
  for (i=0;i<5;i++) key += Math.ceil(Math.random()*15).toString(16);
  return key;
}
function waitFor(obj, prop, func, self,  count) {
  if (obj[prop]) {
     func.apply(self);
  } else {
    count = count || 0;
    if (count < 1000) setTimeout(function() {
      waitFor(obj, prop, func, self, count + 1)
    }, 0);
  }
}
function attachScript(url) {
  setTimeout(function() {
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = url || w.fastXDM.helperUrl;
    waitFor(document, 'body', function() {
      document.getElementsByTagName('HEAD')[0].appendChild(newScript);
    });
  }, 0);
}

// Env functions
function getEnv(callback, self) {
  if (env.loaded) {
    callback.apply(self, [env]);
  } else {
    onEnvLoad.push([self, callback]);
  }
}

function envLoaded() {
  env.loaded = true;
  var i = onEnvLoad.length;
  while (i--) {
    onEnvLoad[i][1].apply(onEnvLoad[i][0], [env]);
  }
}

function applyMethod(strData, self) {
  getEnv(function(env) {
    var data = env.json.parse(strData);
    if (data[0]) {
      if (!data[1]) data[1] = [];
      var i = data[1].length;
      while (i--) {
        if (data[1][i]._func) {
          var funcNum = data[1][i]._func;
          data[1][i] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('_func'+funcNum);
            self.callMethod.apply(self, args);
          }
        }
      }
      setTimeout(function() {
        if (!self.methods[data[0]]) throw Error('fastXDM: Method ' + data[0] + ' is undefined');
        self.methods[data[0]].apply(self, data[1]);
      }, 0);
    }
  });
}
// XDM object
w.fastXDM = {
  _id: 0,
  helperUrl: (location.protocol == 'https:' ? 'https://vk.com/' : 'http://userapi.com/') + 'js/api/xdmHelper.js?2',

  Server: function(methods, filter) {
    this.methods = methods || {};
    this.id = w.fastXDM._id++;
    this.filter = filter;
    this.key = genKey();
    this.methods['%init%'] = this.methods.__fxdm_i = function() {
      w.fastXDM.run(this.id);
      if (this.methods.onInit) this.methods.onInit();
    };
    this.frameName = 'fXD'+this.key;
    this.server = true;
    handlers[this.key] = [applyMethod, this];
  },

  Client: function(methods) {
    this.methods = methods || {};
    this.id = w.fastXDM._id++;
    w.fastXDM.run(this.id);
    if (window.name.indexOf('fXD') === 0) {
      this.key = window.name.substr(3);
    } else {
      throw Error('Wrong window.name property.');
    }
    this.caller = window.parent;
    handlers[this.key] = [applyMethod, this];
    this.client = true;

    w.fastXDM.on('helper', function() {
      w.fastXDM.onClientStart(this);
    }, this);

    getEnv(function(env) {
      env.send(this, env.json.stringify(['%init%']));
      var methods = this.methods;
      setTimeout(function() {
        if (methods.onInit) methods.onInit();
      }, 0);
    }, this);
  },

  onMessage: function(e) {
    if (!e.data) return false;
    var key = e.data.substr(0, 5);
    if (handlers[key]) {
      var self = handlers[key][1];
      if (self && (!self.filter || self.filter(e.origin))) {
        handlers[key][0](e.data.substr(6), self);
      }
    }
  },

  setJSON: function(json) {
    env.json = json;
  },

  getJSON: function(callback) {
    if (!callback) return env.json;
    getEnv(function(env) {
      callback(env.json);
    });
  },

  setEnv: function(exEnv) {
    var i;
    for (i in exEnv) {
      env[i] = exEnv[i];
    }
    envLoaded();
  },

  _q: {},

  on: function(key, act, self) {
    if (!this._q[key]) this._q[key] = [];
    if (this._q[key] == -1) {
      act.apply(self);
    } else {
      this._q[key].push([act, self]);
    }
  },

  run: function(key) {
    var len = (this._q[key] || []).length;
    if (this._q[key] && len > 0) {
      for (var i = 0; i < len; i++) this._q[key][i][0].apply(this._q[key][i][1]);
    }
    this._q[key] = -1;
  },

  waitFor: waitFor
}

w.fastXDM.Server.prototype.start = function(obj, count) {
  if (obj.contentWindow) {
    this.caller = obj.contentWindow;
    this.frame = obj;

    w.fastXDM.on('helper', function() {
      w.fastXDM.onServerStart(this);
    }, this);

  } else { // Opera old versions
    var self = this;
    count = count || 0;
    if (count < 50) setTimeout(function() {
      self.start.apply(self, [obj, count+1]);
    }, 100);
  }
}

function extend(obj1, obj2){
  for (var i in obj2) {
    if (obj1[i] && typeof(obj1[i]) == 'object') {
      extend(obj1[i], obj2[i])
    } else {
      obj1[i] = obj2[i];
    }
  }
}

w.fastXDM.Server.prototype.append = function(obj, options) {
  var div = document.createElement('DIV');
  div.innerHTML = '<iframe name="'+this.frameName+'" ></iframe>';
  var frame = div.firstChild;
  var self = this;
  setTimeout(function() {
    frame.frameBorder = '0';
    if (options) extend(frame, options);
    obj.insertBefore(frame, obj.firstChild);
    self.start(frame);
  }, 0);
  return frame;
}

w.fastXDM.Client.prototype.callMethod = w.fastXDM.Server.prototype.callMethod = function() {
  var args = Array.prototype.slice.call(arguments);
  var method = args.shift();
  var i = args.length;
  while (i--) {
    if (typeof(args[i]) == 'function') {
      this.funcsCount = (this.funcsCount || 0) + 1;
      var func = args[i];
      var funcName = '_func' + this.funcsCount;
      this.methods[funcName] = function() {
        func.apply(this, arguments);
        delete this.methods[funcName];
      }
      args[i] = {_func: this.funcsCount};
    }
  }
  waitFor(this, 'caller', function() {
    w.fastXDM.on(this.id, function() {
      getEnv(function(env) {
        env.send(this, env.json.stringify([method, args]));
      }, this);
    }, this);
  }, this);
}

if (w.JSON && typeof(w.JSON) == 'object' && w.JSON.parse && w.JSON.stringify && w.JSON.stringify({a:[1,2,3]}).replace(/ /g, '') == '{"a":[1,2,3]}') {
  env.json = {parse: w.JSON.parse, stringify: w.JSON.stringify};
} else {
  w.fastXDM._needJSON = true;
}

// PostMessage cover
if (w.postMessage) {
  env.protocol = 'p';
  env.send = function(xdm, strData) {
    // alert(key+':'+strData);
    xdm.caller.postMessage(xdm.key+':'+strData, "*");
  }
  if (w.addEventListener) {
    w.addEventListener("message", w.fastXDM.onMessage, false);
  } else {
    w.attachEvent("onmessage", w.fastXDM.onMessage);
  }

  if (w.fastXDM._needJSON) {
    w.fastXDM._onlyJSON = true;
    attachScript();
  } else {
    envLoaded();
  }
} else {
  attachScript();
}
})(window);


if (!window.VK) window.VK = {};


/*
 * Based on JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 */
if(!VK.MD5){VK.MD5=function(n){var j=function(o,r){var q=(o&65535)+(r&65535),p=(o>>16)+(r>>16)+(q>>16);return(p<<16)|(q&65535)},g=function(o,p){return(o<<p)|(o>>>(32-p))},k=function(w,r,p,o,v,u){return j(g(j(j(r,w),j(o,u)),v),p)},a=function(q,p,w,v,o,u,r){return k((p&w)|((~p)&v),q,p,o,u,r)},h=function(q,p,w,v,o,u,r){return k((p&v)|(w&(~v)),q,p,o,u,r)},c=function(q,p,w,v,o,u,r){return k(p^w^v,q,p,o,u,r)},m=function(q,p,w,v,o,u,r){return k(w^(p|(~v)),q,p,o,u,r)},b=function(A,u){var z=1732584193,y=-271733879,w=-1732584194,v=271733878,r,q,p,o;A[u>>5]|=128<<((u)%32);A[(((u+64)>>>9)<<4)+14]=u;for(var t=0,s=A.length;t<s;t+=16){r=z;q=y;p=w;o=v;z=a(z,y,w,v,A[t+0],7,-680876936);v=a(v,z,y,w,A[t+1],12,-389564586);w=a(w,v,z,y,A[t+2],17,606105819);y=a(y,w,v,z,A[t+3],22,-1044525330);z=a(z,y,w,v,A[t+4],7,-176418897);v=a(v,z,y,w,A[t+5],12,1200080426);w=a(w,v,z,y,A[t+6],17,-1473231341);y=a(y,w,v,z,A[t+7],22,-45705983);z=a(z,y,w,v,A[t+8],7,1770035416);v=a(v,z,y,w,A[t+9],12,-1958414417);w=a(w,v,z,y,A[t+10],17,-42063);y=a(y,w,v,z,A[t+11],22,-1990404162);z=a(z,y,w,v,A[t+12],7,1804603682);v=a(v,z,y,w,A[t+13],12,-40341101);w=a(w,v,z,y,A[t+14],17,-1502002290);y=a(y,w,v,z,A[t+15],22,1236535329);z=h(z,y,w,v,A[t+1],5,-165796510);v=h(v,z,y,w,A[t+6],9,-1069501632);w=h(w,v,z,y,A[t+11],14,643717713);y=h(y,w,v,z,A[t+0],20,-373897302);z=h(z,y,w,v,A[t+5],5,-701558691);v=h(v,z,y,w,A[t+10],9,38016083);w=h(w,v,z,y,A[t+15],14,-660478335);y=h(y,w,v,z,A[t+4],20,-405537848);z=h(z,y,w,v,A[t+9],5,568446438);v=h(v,z,y,w,A[t+14],9,-1019803690);w=h(w,v,z,y,A[t+3],14,-187363961);y=h(y,w,v,z,A[t+8],20,1163531501);z=h(z,y,w,v,A[t+13],5,-1444681467);v=h(v,z,y,w,A[t+2],9,-51403784);w=h(w,v,z,y,A[t+7],14,1735328473);y=h(y,w,v,z,A[t+12],20,-1926607734);z=c(z,y,w,v,A[t+5],4,-378558);v=c(v,z,y,w,A[t+8],11,-2022574463);w=c(w,v,z,y,A[t+11],16,1839030562);y=c(y,w,v,z,A[t+14],23,-35309556);z=c(z,y,w,v,A[t+1],4,-1530992060);v=c(v,z,y,w,A[t+4],11,1272893353);w=c(w,v,z,y,A[t+7],16,-155497632);y=c(y,w,v,z,A[t+10],23,-1094730640);z=c(z,y,w,v,A[t+13],4,681279174);v=c(v,z,y,w,A[t+0],11,-358537222);w=c(w,v,z,y,A[t+3],16,-722521979);y=c(y,w,v,z,A[t+6],23,76029189);z=c(z,y,w,v,A[t+9],4,-640364487);v=c(v,z,y,w,A[t+12],11,-421815835);w=c(w,v,z,y,A[t+15],16,530742520);y=c(y,w,v,z,A[t+2],23,-995338651);z=m(z,y,w,v,A[t+0],6,-198630844);v=m(v,z,y,w,A[t+7],10,1126891415);w=m(w,v,z,y,A[t+14],15,-1416354905);y=m(y,w,v,z,A[t+5],21,-57434055);z=m(z,y,w,v,A[t+12],6,1700485571);v=m(v,z,y,w,A[t+3],10,-1894986606);w=m(w,v,z,y,A[t+10],15,-1051523);y=m(y,w,v,z,A[t+1],21,-2054922799);z=m(z,y,w,v,A[t+8],6,1873313359);v=m(v,z,y,w,A[t+15],10,-30611744);w=m(w,v,z,y,A[t+6],15,-1560198380);y=m(y,w,v,z,A[t+13],21,1309151649);z=m(z,y,w,v,A[t+4],6,-145523070);v=m(v,z,y,w,A[t+11],10,-1120210379);w=m(w,v,z,y,A[t+2],15,718787259);y=m(y,w,v,z,A[t+9],21,-343485551);z=j(z,r);y=j(y,q);w=j(w,p);v=j(v,o)}return[z,y,w,v]},f=function(r){var q="",s=-1,p=r.length,o,t;while(++s<p){o=r.charCodeAt(s);t=s+1<p?r.charCodeAt(s+1):0;if(55296<=o&&o<=56319&&56320<=t&&t<=57343){o=65536+((o&1023)<<10)+(t&1023);s++}if(o<=127){q+=String.fromCharCode(o)}else{if(o<=2047){q+=String.fromCharCode(192|((o>>>6)&31),128|(o&63))}else{if(o<=65535){q+=String.fromCharCode(224|((o>>>12)&15),128|((o>>>6)&63),128|(o&63))}else{if(o<=2097151){q+=String.fromCharCode(240|((o>>>18)&7),128|((o>>>12)&63),128|((o>>>6)&63),128|(o&63))}}}}}return q},e=function(p){var o=Array(p.length>>2),r,q;for(r=0,q=o.length;r<q;r++){o[r]=0}for(r=0,q=p.length*8;r<q;r+=8){o[r>>5]|=(p.charCodeAt(r/8)&255)<<(r%32)}return o},l=function(p){var o="";for(var r=0,q=p.length*32;r<q;r+=8){o+=String.fromCharCode((p[r>>5]>>>(r%32))&255)}return o},d=function(o){return l(b(e(o),o.length*8))},i=function(q){var t="0123456789abcdef",p="",o;for(var s=0,r=q.length;s<r;s++){o=q.charCodeAt(s);p+=t.charAt((o>>>4)&15)+t.charAt(o&15)}return p};return i(d(f(n)))}}

/*
 * VKontakte Open API JavaScript library
 * http://vk.com/
 */

VK.extend = function(target, source, overwrite) {
  for (var key in source) {
    if (overwrite || typeof target[key] === 'undefined') {
      target[key] = source[key];
    }
  }
  return target;
};

VK._protocol = ((location.protocol === 'https:') ? 'https:' : 'http:');

if (!VK.xdConnectionCallbacks) {

VK.extend(VK, {
  _apiId: null,
  _session: null,
  _userStatus: 'unknown',
  _domain: {
    main: 'https://oauth.vk.com/',
    api: 'https://api.vk.com/'
  },
  _path: {
    login: 'authorize',
    proxy: 'fxdm_oauth_proxy.html'
  },
  _rootId: 'vk_api_transport',
  _nameTransportPath: '',
  xdReady: false,
  access: {
    FRIENDS:   0x2,
    PHOTOS:    0x4,
    AUDIO:     0x8,
    VIDEO:     0x10,
    MATCHES:   0x20,
    QUESTIONS: 0x40,
    WIKI:      0x80
  }
});

VK.init = function(options) {
  var body, root;

  VK._apiId = null;
  if (!options.apiId) {
    throw 'VK.init() called without an apiId'
  }
  VK._apiId = options.apiId;

  if (options.onlyWidgets) return true;

  if (options.nameTransportPath && options.nameTransportPath !== '') {
    VK._nameTransportPath = options.nameTransportPath;
  }

  root = document.getElementById(VK._rootId);
  if (!root) {
    root = document.createElement('div');
    root.id = VK._rootId;
    body = document.getElementsByTagName('body')[0];
    body.insertBefore(root, body.childNodes[0]);
  }
  root.style.position = 'absolute';
  root.style.top = '-10000px';

  var session = VK.Cookie.load();
  if (session) {
    VK.Auth._loadState = 'loaded';
    VK.Auth.setSession(session, session ? 'connected' : 'unknown');
  }
};

if (!VK.Cookie) {
VK.Cookie = {
  _domain: null,
  load: function() {
    var
      cookie = document.cookie.match('\\bvk_app_' + VK._apiId + '=([^;]*)\\b'),
      session;

    if (cookie) {
      session = this.decode(cookie[1]);
      if (session.secret != 'oauth') {
        return false;
      }
      session.expire = parseInt(session.expire, 10);
      VK.Cookie._domain = '.' + window.location.hostname;//session.base_domain;
    }

    return session;
  },
  setRaw: function(val, ts, domain, time) {
    var rawCookie;
    rawCookie = 'vk_app_' + VK._apiId + '=' + val + '';
    var exp = time ? (new Date().getTime() + time * 1000) : ts * 1000;
    rawCookie += (val && ts === 0 ? '' : '; expires=' + new Date(exp).toGMTString());
    rawCookie += '; path=/';
    rawCookie += (domain ? '; domain=.' + domain : '');
    document.cookie = rawCookie;

    this._domain = domain;
  },
  set: function(session, resp) {
    if (session) {
      this.setRaw(this.encode(session), session.expire, window.location.hostname, (resp || {}).time);
    } else {
      this.clear();
    }
  },
  clear: function() {
    this.setRaw('', 0, this._domain, 0);
  },
  encode: function(params) {
    var
      pairs = [],
      key;

    for (key in params) {
      if (key != 'user') pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    pairs.sort();

    return pairs.join('&');
  },
  decode: function(str) {
    var
      params = {},
      parts = str.split('&'),
      i,
      pair;

    for (i=0; i < parts.length; i++) {
      pair = parts[i].split('=', 2);
      if (pair && pair[0]) {
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }

    return params;
  }
};
}

if (!VK.Api) {
VK.Api = {
  _headId: null,
  _callbacks: {},
  ie6_7: function() {
    if (!VK.Api.ieTested) {
      VK.Api.isIE6_7 = navigator.userAgent.match(/MSIE [6|7]/i);
      VK.Api.ieTested = true;
    }
    return VK.Api.isIE6_7;
  },
  attachScript: function(url) {
    if (!VK.Api._headId) VK.Api._headId = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.setAttribute('encoding', 'UTF-8');
    newScript.src = url;
    VK.Api._headId.appendChild(newScript);
  },
  checkMethod: function(method, params, cb, queryTry) {
    var m = method.toLowerCase();
    if (m == 'wall.post' || m == 'activity.set') {
      var text = (m == 'activity.set') ? params.text : params.message;
      var query =  VK._protocol + '//vk.com/al_apps.php?act=wall_post_box&widget=1&method='+m+'&aid=' + parseInt(VK._apiId, 10) + '&text=' + encodeURIComponent(text);
      if (m == 'wall.post') {
        query += '&owner_id=' + parseInt(params.owner_id || 0, 10) + '&attachments=' + (params.attachments || params.attachment || '');
      }
      var method_access = '_'+(Math.random()).toString(16).substr(2);
      query += '&method_access='+method_access;
      var popup = VK.UI.popup({
        url: query,
        width: 460,
        height: 220
      });
      var timer = setInterval(function() {
        if (VK.UI.active.closed) {
          clearInterval(timer);
          params.method_access = method_access;
          VK.Api.call(method, params, cb, queryTry);
        }
      }, 500);
      return false;
    }
    return true;
  },
  call: function(method, params, cb, queryTry) {
    var
      query = params || {},
      qs,
      responseCb;

    if (typeof query != 'object' || typeof cb != 'function') {
      return false;
    }
    if (!params.method_access && !params.method_force && !VK.Api.checkMethod(method, params, cb, queryTry)) {
      return;
    }

    if (!queryTry) queryTry = 0;

    if (VK.Auth._loadState != 'loaded') {
      var authFunc = function(result) {
        if (result && result.session) {
          VK.Observer.unsubscribe('auth.loginStatus', authFunc);
          VK.Api.call(method, params, cb);
        }
      };
      VK.Observer.subscribe('auth.loginStatus', authFunc);
      VK.Auth.getLoginStatus();
      return;
    }

    if (VK.Api.queryLength(query) < 1500 && !VK.Api.ie6_7()) {
      var useXDM = false;
      var rnd = parseInt(Math.random() * 10000000, 10);
      while (VK.Api._callbacks[rnd]) {
        rnd = parseInt(Math.random() * 10000000, 10)
      }
      query.callback = 'VK.Api._callbacks['+rnd+']';
    } else {
      var useXDM = true;
    }

    if (VK._session && VK._session.sid) {
      query.access_token = VK._session.sid;
    }

    qs = VK.Cookie.encode(query);

    responseCb = function(response) {
      if (response.error && (response.error.error_code == 3 || response.error.error_code == 4 || response.error.error_code == 5)) {
        if (queryTry > 3) return false;
        var repeatCall = function(resp) {
          VK.Observer.unsubscribe('auth.sessionChange', repeatCall);
          delete params.access_token;
          if (resp.session) VK.Api.call(method, params, cb, queryTry + 1);
        }
        VK.Observer.subscribe('auth.sessionChange', repeatCall);
        VK.Auth.getLoginStatus();
      } else {
        cb(response);
      }
      if (!useXDM) delete VK.Api._callbacks[rnd];
    };

    if (useXDM) {
      if (VK.xdReady) {
        VK.XDM.remote.callMethod('apiCall', method, qs, responseCb);
      } else {
        VK.Observer.subscribe('xdm.init', function() {VK.XDM.remote.callMethod('apiCall', method, qs, responseCb);});
        VK.XDM.init();
      }
    } else {
      VK.Api._callbacks[rnd] = responseCb;
      VK.Api.attachScript(VK._domain.api + 'method/' + method +'?' + qs);
    }
  },
  queryLength: function(query) {
    var len = 100, i; // sid + sig
    for (i in query) {
      len += i.length + encodeURIComponent(query.i).length + 1;
    }
    return len;
  }
};

// Alias
VK.api = function(method, params, cb) {VK.Api.call(method, params, cb);}
};

if (!VK.Auth) {
VK.Auth = {
  popup: null,
  lsCb: {},
  setSession: function(session, status, settings, resp) {
    var
      login = !VK._session && session,
      logout = VK._session && !session,
      both = VK._session && session && VK._session.mid != session.mid,
      sessionChange = login || logout || (VK._session && session && VK._session.sid != session.sid),
      statusChange = status != VK._userStatus,
      response = {
        'session': session,
        'status': status,
        'settings': settings
      };

    VK._session = session;

    VK._userStatus = status;

    VK.Cookie.set(session, resp);

    if (sessionChange || statusChange || both) {
      setTimeout(function() {
        if (statusChange) {
          VK.Observer.publish('auth.statusChange', response);
        }

        if (logout || both) {
          VK.Observer.publish('auth.logout', response);
        }

        if (login || both) {
          if (VK.xdReady) VK.XDM.remote.init(VK._apiId, session, status);
          VK.Observer.publish('auth.login', response);
        }

        if (sessionChange) {
          VK.Observer.publish('auth.sessionChange', response);
        }
      }, 0);
    }

    return response;
  },
  // Public VK.Auth methods
  login: function(cb, settings) {
    var channel, url;
    if (!VK._apiId) {
      return false;
    }
    channel = window.location.protocol + '//' + window.location.hostname;
    url = VK._domain.main + VK._path.login + '?client_id='+VK._apiId+'&display=popup&redirect_uri=close.html&response_type=token';
    if (settings && parseInt(settings, 10) > 0) {
      url += '&scope=' + settings;
    }
    VK.Observer.unsubscribe('auth.onLogin');
    VK.Observer.subscribe('auth.onLogin', cb);
    VK.UI.popup({
      width: 620,
      height: 370,
      url: url
    });
    var authCallback = function() {
      VK.Auth.getLoginStatus(function(resp) {
        VK.Observer.publish('auth.onLogin', resp);
        VK.Observer.unsubscribe('auth.onLogin');
      }, true);
    }

    VK.UI.popupOpened = true;
    var popupCheck = function() {
      if (!VK.UI.popupOpened) return false;
      try {
        if (!VK.UI.active.top) {
          VK.UI.popupOpened = false;
          authCallback();
          return true;
        }
      } catch(e) {
        VK.UI.popupOpened = false;
        authCallback();
        return true;
      }
      setTimeout(popupCheck, 100);
    };

    setTimeout(popupCheck, 100);
  },
  // Logout user from app, vk.com & login.vk.com
  logout: function(cb) {
    VK.Auth.revokeGrants(cb);
  },
  revokeGrants: function(cb) {
    var onLogout = function(resp) {
      VK.Observer.unsubscribe('auth.statusChange', onLogout);
      if (cb) cb(resp);
    }
    VK.Observer.subscribe('auth.statusChange', onLogout);
    if (VK._session && VK._session.sid) VK.Api.attachScript('https://login.vk.com/?act=openapi&oauth=1&aid=' + parseInt(VK._apiId, 10) + '&location=' + encodeURIComponent(window.location.hostname)+'&do_logout=1&token='+VK._session.sid);
    VK.Cookie.clear();
  },
  // Get current login status from session (sync) (not use on load time)
  getSession: function() {
    return VK._session;
  },
  // Get current login status from vk.com (async)
  getLoginStatus: function(cb, force) {
    if (!VK._apiId) {
      return;
    }

    if (cb) {
      if (!force && VK.Auth._loadState == 'loaded') {
        cb({status: VK._userStatus, session: VK._session});
        return;
      } else {
        VK.Observer.subscribe('auth.loginStatus', cb);
      }
    }

    if (!force && VK.Auth._loadState == 'loading') {
      return;
    }

    VK.Auth._loadState = 'loading';
    var rnd = parseInt(Math.random() * 10000000, 10);
    while (VK.Auth.lsCb[rnd]) {
      rnd = parseInt(Math.random() * 10000000, 10)
    }
    VK.Auth.lsCb[rnd] = function(response) {
      delete VK.Auth.lsCb[rnd];
      VK.Auth._loadState = 'loaded';
      if (response && response.auth) {
        var session = {
          mid: response.user.id,
          sid: response.access_token,
          sig: response.sig,
          secret: response.secret,
          expire: response.expire
        };
        if (force) session.user = response.user;
        var status = 'connected';
      } else {
        var session = null;
        var status = response.user ? 'logined' : 'unknown';
        VK.Cookie.clear();
      }
      VK.Auth.setSession(session, status, false, response);
      VK.Observer.publish('auth.loginStatus', {session: session, status: status});
      VK.Observer.unsubscribe('auth.loginStatus');
    };
    // AttachScript here
    VK.Api.attachScript('https://login.vk.com/?act=openapi&oauth=1&aid=' + parseInt(VK._apiId, 10) + '&location=' + encodeURIComponent(window.location.hostname)+'&rnd='+rnd);
  }
};
}

} else { // if VK.xdConnectionCallbacks
  setTimeout(function() {
    var callback;
    while (callback = VK.xdConnectionCallbacks.pop()) {
      callback();
    }
  }, 0);
  if (VK.Widgets && !VK.Widgets._constructor) {
    VK.Widgets = false;
  }
}

if (!VK.UI) {
VK.UI = {
  active: null,
  _buttons: [],
  popup: function(options) {
    var
      screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
      width = options.width,
      height = options.height,
      left = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
      );
      this.active = window.open(options.url, 'vk_openapi', features);
  },
  button: function(el, handler) {
    var html = '';

    if (typeof el == 'string') {
      el = document.getElementById(el);
    }


    this._buttons.push(el);
    index = this._buttons.length - 1;

    html = (
      '<table cellspacing="0" cellpadding="0" id="openapi_UI_' + index + '" onmouseover="VK.UI._change(1, ' + index + ');" onmouseout="VK.UI._change(0, ' + index + ');" onmousedown="VK.UI._change(2, ' + index + ');" onmouseup="VK.UI._change(1, ' + index + ');" style="cursor: pointer; border: 0px; font-family: tahoma, arial, verdana, sans-serif, Lucida Sans; font-size: 10px;"><tr style="vertical-align: middle">' +
      '<td><div style="border: 1px solid #3b6798;border-radius: 2px 0px 0px 2px;-moz-border-radius: 2px 0px 0px 2px;-webkit-border-radius: 2px 0px 0px 2px;"><div style="border: 1px solid #5c82ab; border-top-color: #7e9cbc; background-color: #6D8DB1; color: #fff; text-shadow: 0px 1px #45688E; height: 15px; padding: 2px 4px 0px 6px;line-height: 13px;">&#1042;&#1086;&#1081;&#1090;&#1080;</div></div></td>' +
      '<td><div style="background: url(' + VK._protocol + '//vk.com/images/btns.png) 0px -42px no-repeat; width: 21px; height: 21px"></div></td>' +
      '<td><div style="border: 1px solid #3b6798;border-radius: 0px 2px 2px 0px;-moz-border-radius: 0px 2px 2px 0px;-webkit-border-radius: 0px 2px 2px 0px;"><div style="border: 1px solid #5c82ab; border-top-color: #7e9cbc; background-color: #6D8DB1; color: #fff; text-shadow: 0px 1px #45688E; height: 15px; padding: 2px 6px 0px 4px;line-height: 13px;">&#1050;&#1086;&#1085;&#1090;&#1072;&#1082;&#1090;&#1077;</div></div></td>' +
      '</tr></table>'
    );
    el.innerHTML = html;
    el.style.width = el.childNodes[0].offsetWidth + 'px';
  },
  _change: function(state, index) {
    var row = document.getElementById('openapi_UI_' + index).rows[0];
    var elems = [row.cells[0].firstChild.firstChild, row.cells[2].firstChild.firstChild];
    for (var i = 0; i < 2; ++i) {
       var elem = elems[i];
      if (state === 0) {
        elem.style.backgroundColor = '#6D8DB1';
        elem.style.borderTopColor = '#7E9CBC';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderBottomColor = '#5C82AB';
      } else if (state == 1) {
        elem.style.backgroundColor = '#7693B6';
        elem.style.borderTopColor = '#88A4C4';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderBottomColor = '#6088B4';
      } else if (state == 2) {
        elem.style.backgroundColor = '#6688AD';
        elem.style.borderBottomColor = '#7495B8';
        elem.style.borderLeftColor = elem.style.borderRightColor = elem.style.borderTopColor = '#51779F';
      }
    }
    if (state === 0 || state == 2) {
      row.cells[2].firstChild.style.backgroundPosition = '0px -42px';
    } else if (state == 1) {
      row.cells[2].firstChild.style.backgroundPosition = '0px -63px';
    }
  }
};
}

if (!VK.XDM) {
VK.XDM = {
  remote: null,
  init: function() {
    if (this.remote) return false;
    var url = VK._domain.api + VK._path.proxy;
    this.remote = new fastXDM.Server({
      onInit: function() {
        VK.XDM.remote.callMethod('init', VK._apiId, VK._session, VK._userStatus);
        VK.xdReady = true;
        VK.Observer.publish('xdm.init');
      },
      setSession: {
        isVoid: true,
        method: function(session, status) {
          VK.Auth.setSession(session, status);
        }
      },
      alert: {
        isVoid: true,
        method: function(text) {
          alert(text);
        }
      }
    });

    this.remote.append(document.getElementById(VK._rootId), {
      src: url
    });
  },
  xdHandler: function(code) {
    try {
      eval('VK.' + code);
    } catch(e) {}
  }
};
}

if (!VK.Observer) {
VK.Observer = {
  _subscribers: function() {
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },
  publish: function(eventName) {
    var
      args = Array.prototype.slice.call(arguments),
      eventName = args.shift(),
      subscribers = this._subscribers()[eventName],
      i, j;

    if (!subscribers) return;

    for (i = 0, j = subscribers.length; i < j; i++) {
      if (subscribers[i] != null) {
        subscribers[i].apply(this, args);
      }
    }
  },
  subscribe: function(eventName, handler) {
    var
      subscribers = this._subscribers();

    if (typeof handler != 'function') return false;

    if (!subscribers[eventName]) {
      subscribers[eventName] = [handler];
    } else {
      subscribers[eventName].push(handler);
    }
  },
  unsubscribe: function(eventName, handler) {
    var
      subscribers = this._subscribers()[eventName],
      i, j;

    if (!subscribers) return false;
    if (typeof handler == 'function') {
      for (i = 0, j = subscribers.length; i < j; i++) {
        if (subscribers[i] == handler) {
          subscribers[i] = null;
        }
      }
    } else {
      delete this._subscribers()[eventName];
    }
  }
};
}

if (!VK.Widgets) {
  VK.Widgets = {};

  VK.Widgets.count = 0;
  VK.Widgets.RPC = {};

  VK.Widgets.loading = function(obj, enabled) {
    obj.style.background = enabled ? 'url("' + VK._protocol + '//vk.com/images/upload.gif") center center no-repeat transparent' : 'none';
  };

  VK.Widgets.Comments = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      limit: options.limit || 10,
      height: options.height || 0,
      mini: options.mini === undefined ? 'auto' : options.mini,
      norealtime: options.norealtime ? 1 : 0
    }, mouseup = function () {
      rpc.callMethod('mouseUp');
      return false;
    }, move = function (event) {
      rpc.callMethod('mouseMove', {screenY: event.screenY});
    }, iframe, rpc;

    if (options.browse) { // browse all comments
      params.browse = 1;
      params.replies = options.replies || 0;
    } else { // page
      VK.extend(params, {
        page: page || 0,
        status_publish: options.autoPublish === undefined ? 1 : options.autoPublish,
        attach: options.attach === undefined ? '*' : (options.attach ? options.attach : ''),
        url: options.pageUrl || pData.url,
        title: options.pageTitle || pData.title,
        description: options.pageDescription || pData.description,
        image: options.pageImage || pData.image
      });
    }
    if (options.onChange) { // DEPRECATED
      VK.Observer.subscribe('widgets.comments.new_comment', options.onChange);
      VK.Observer.subscribe('widgets.comments.delete_comment', options.onChange);
    }

    return VK.Widgets._constructor('widget_comments.php', objId, options, params, {
      showBox: function (url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
          proxy: function () {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      startDrag: function() {
        cursorBack = window.document.body.style.cursor;
        window.document.body.style.cursor = 'pointer';
        VK.Util.addEvent('mousemove', move);
        VK.Util.addEvent('mouseup', mouseup);
      },
      stopDrag: function() {
        window.document.body.style.cursor = cursorBack;
        VK.Util.removeEvent('mousemove', move);
        VK.Util.removeEvent('mouseup', mouseup);
      }
    }, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    }, function (o, i, r) {iframe = i; rpc = r;});
  };

  VK.Widgets.CommentsBrowse = function(objId, options) {
    options = options || {};
    options.browse = 1;
    return VK.Widgets.Comments(objId, options);
  };

  VK.Widgets.Recommended = function(objId, options) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      limit: options.limit || 5,
      max: options.max || 0,
      sort: options.sort || 'friend_likes',
      verb: options.verb || 0,
      period: options.period || 'week',
      target: options.target || 'parent'
    };
    return VK.Widgets._constructor('widget_recommended.php', objId, options, params, {}, {
      startHeight: (90 + params.limit * 30),
      minWidth: 150,
      width: '100%'
    });
  };

  VK.Widgets.Like = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = VK.extend(options || {}, {allowTransparency: true});
    if (options.type == 'button' || options.type == 'vertical' || options.type == 'mini') delete options.width;
    var
      type = (options.type == 'full' || options.type == 'button' || options.type == 'vertical' || options.type == 'mini') ? options.type : 'full',
      width = type == 'full' ? Math.max(200, options.width || 350) : (type == 'button' ? 180 : (type == 'mini' ? 100 : 41)),
      btnHeight = parseInt(options.height, 10) || 22,
      height = type == 'vertical' ? (2 * btnHeight + 7) : (type == 'full' ? btnHeight + 1 : btnHeight),
      params = {
        page: page || 0,
        url: options.pageUrl || pData.url,
        type: type,
        verb: options.verb == 1 ? 1 : 0,
        title: options.pageTitle || pData.title,
        description: options.pageDescription || pData.description,
        image: options.pageImage || pData.image,
        text: (options.text || '').substr(0, 140),
        h: btnHeight
      },
      ttHere = options.ttHere || false,
      isOver = false,
      obj, buttonIfr, buttonRpc, tooltipIfr, tooltipRpc, checkTO, statsBox;

    function showTooltip(force) {
      if ((!isOver && !force) || !tooltipRpc) return;
      if (!tooltipIfr || !tooltipRpc || tooltipIfr.style.display != 'none' && tooltipIfr.getAttribute('vkhidden') != 'yes') return;
      var scrollTop = options.getScrollTop ? options.getScrollTop() : (document.body.scrollTop || document.documentElement.scrollTop || 0);
      var objPos = VK.Util.getXY(obj, options.fixed);
      var startY = ttHere ? 0 : objPos[1];
      if (scrollTop > objPos[1] - 120 && options.tooltipPos != 'top' || type == 'vertical' || options.tooltipPos == 'bottom') {
        tooltipIfr.style.top = (startY + height + 2) + 'px';
        tooltipRpc.callMethod('show', false);
      } else {
        tooltipIfr.style.top = (startY - 125) + 'px';
        tooltipRpc.callMethod('show', true);
      }
      VK.Util.ss(tooltipIfr, {left: ((ttHere ? 0 : objPos[0]) - (type == 'vertical' || type == 'mini' ? 36 : 2)) + 'px', display: 'block', opacity: 1, filter: 'none'});
      tooltipIfr.setAttribute('vkhidden', 'no');
      isOver = true;
    }

    function hideTooltip(force) {
      if ((isOver && !force) || !tooltipRpc) return;
      tooltipRpc.callMethod('hide');
      buttonRpc.callMethod('hide');
      setTimeout(function () {
        tooltipIfr.style.display = 'none'
      }, 400);
    }

    return VK.Widgets._constructor('widget_like.php', objId, options, params, {
      initTooltip: function (counter) {
        tooltipRpc = new fastXDM.Server({
          onInit: counter ? function() {showTooltip(true)} : function () {},
          proxy: function () {
             buttonRpc.callMethod.apply(buttonRpc, arguments);
          },
          showBox: function (url, props) {
            var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
              proxy: function () {
                tooltipRpc.callMethod.apply(tooltipRpc, arguments);
              }
            });
            box.show();
          },
          statsBox: function (act) {
            hideTooltip(true);
            statsBox = VK.Util.Box(buttonIfr.src + '&act=a_stats_box', [498, 442]);
            statsBox.show();
          }
        });
        tooltipIfr = tooltipRpc.append(ttHere ? obj : document.body, {
          src: buttonIfr.src + '&act=a_share_tooltip',
          scrolling: 'no',
          allowTransparency: true,
          id: buttonIfr.id + '_tt',
          style: {position: 'absolute', padding: 0, display: 'block', opacity: 0.01, filter: 'alpha(opacity=1)', border: '0', width: '206px', height: '127px', zIndex: 5000, overflow: 'hidden'}
        });
        tooltipIfr.setAttribute('vkhidden', 'yes');

        obj.onmouseover = tooltipIfr.onmouseover = function () {isOver = true;};
        obj.onmouseout = tooltipIfr.onmouseout = function () {
          clearTimeout(checkTO);
          isOver = false;
          checkTO = setTimeout(function () {hideTooltip(); }, 200);
        };
      },
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      showBox: function (url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
          proxy: function () {
            buttonRpc.callMethod.apply(buttonRpc, arguments);
          }
        });
        box.show();
      },
      proxy: function () {if (tooltipRpc) tooltipRpc.callMethod.apply(tooltipRpc, arguments);}
    }, {
      startHeight: height,
      minWidth: width
    }, function (o, i, r) {
      buttonRpc = r;
      VK.Util.ss(obj = o, {height: height + 'px', width: width + 'px', position: 'relative', clear: 'both'});
      VK.Util.ss(buttonIfr = i, {height: height + 'px', width: width + 'px', overflow: 'hidden', zIndex: 150});
    });
  };

  VK.Widgets.Poll = function(objId, options, pollId) {
    var pData = VK.Util.getPageData();
    // if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    if (!pollId) throw Error('No poll id passed');
    options = options || {};
    var params = {
      poll_id: pollId,
      url: options.pageUrl || pData.url || location.href,
      title: options.pageTitle || pData.title,
      description: options.pageDescription || pData.description
    };
    return VK.Widgets._constructor('widget_poll.php', objId, options, params, {}, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    });
  };

  VK.Widgets.PagePoll = function(objId, options, page) {
    var pData = VK.Util.getPageData();
    // if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    options = options || {};
    var params = {
      page: page || 0,
      norealtime: options.norealtime ? 1 : 0,
      poll_id: options.pollId || '',
      url: options.pageUrl || pData.url || location.href,
      title: options.pageTitle || pData.title,
      description: options.pageDescription || pData.description
    };
    return VK.Widgets._constructor('al_widget_poll.php', objId, options, params, {}, {
      startHeight: 133,
      minWidth: 300,
      width: '100%'
    });
  };

  VK.Widgets.Community = VK.Widgets.Group = function(objId, options, gid) {
    gid = parseInt(gid, 10);
    var RPC;
    if (!gid) {
      throw Error('No group_id passed');
    }
    options.mode = parseInt(options.mode, 10).toString();
    var params = {
      gid: gid,
      mode: (options.mode) ? options.mode : '0'
    };
    if (!options.width) {
      options.width = 200;
    }
    if (options.wall) {
      params.wall = options.wall;
    }
    if (!options.height) {
      options.height = 290;
    }
    if (options.wide) {
      params.wide = 1;
      if (options.width < 300) {
        options.width = 300;
      }
    }

    var cursorBack;

    function mouseup() {
      RPC.callMethod('mouseUp');
      return false;
    }

    function move(event) {
      RPC.callMethod('mouseMove', {screenY: event.screenY});
      return false;
    }

    return VK.Widgets._constructor('widget_community.php', objId, options, params, {
      showBox: function (url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
          proxy: function () {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      startDrag: function() {
        cursorBack = window.document.body.style.cursor;
        window.document.body.style.cursor = 'pointer';
        VK.Util.addEvent('mousemove', move);
        VK.Util.addEvent('mouseup', mouseup);
      },
      stopDrag: function() {
        window.document.body.style.cursor = cursorBack;
        VK.Util.removeEvent('mousemove', move);
        VK.Util.removeEvent('mouseup', mouseup);
      },
      auth: function() {
        VK.Auth.login(null, 1);
      }
    }, {
      minWidth: 120,
      width: '200',
      height: '290',
      startHeight: 200
    }, function (o, i, r) {
      RPC = r;
    });
  };

  VK.Widgets.Auth = function(objId, options) {
    var pData = VK.Util.getPageData();
    if (!VK._apiId) throw Error('VK not initialized. Please use VK.init');
    if (!options.width) {
      options.width = 200;
    }
    if (options.type) {
      type = 1;
    } else {
      type = 0;
    }
    return VK.Widgets._constructor('widget_auth.php', objId, options, {}, {makeAuth: function(data) {
      if (data.session) {
        VK.Auth._loadState = 'loaded';
        VK.Auth.setSession(data.session, 'connected');
        VK.Observer.publish('auth.loginStatus', {session: data.session, status: 'connected'});
        VK.Observer.unsubscribe('auth.loginStatus');
      }
      if (options.onAuth) {
        options.onAuth(data);
      } else {
        if (options.authUrl) {
          var href = options.authUrl;
        } else {
          var href = window.location.href;
        }
        if (href.indexOf('?') == -1) {
          href+='?';
        } else {
          href+='&';
        }
        var vars = [];

        for (var i in data) {
          if (i != 'session') vars.push(i+'='+decodeURIComponent(data[i]));
        }
        window.location.href = href + vars.join('&');
      }
    }}, {startHeight: 80});
  };

  VK.Widgets.Subscribe = function(objId, options, oid) {
    oid = parseInt(oid, 10);
    var RPC;
    if (!oid) {
      throw Error('No owner_id passed');
    }
    var params = {
      oid: oid
    };
    if (options.mode) {
      params.mode = options.mode;
    }
    if (options.soft) {
      params.soft = options.soft;
    }

    return VK.Widgets._constructor('widget_subscribe.php', objId, options, params, {
      showBox: function (url, props) {
        var box = VK.Util.Box((options.base_domain || VK._protocol + '//vk.com/') + url, [props.width, props.height], {
          proxy: function () {
            rpc.callMethod.apply(rpc, arguments);
          }
        });
        box.show();
      },
      auth: function() {
        VK.Auth.login(null, 1);
      }
    }, {
      minWidth: 220,
      startHeight: 22,
      height: options.height || 22
    }, function (o, i, r) {
      RPC = r;
    });
  };

  VK.Widgets.Ads = function(objId, options, paramsExtra) {
    options = options || {};
    paramsExtra = paramsExtra || {};
    var params = {};
    var defaults = {};
    var funcs = {};
    var rpc;
    var iframe;

    var paramsExtraFix = {};
    for (var key in paramsExtra) {
      var keyFix = (inArray(key, ['ads_count', 'hash']) ? key : 'ads_' + key);
      paramsExtraFix[keyFix] = paramsExtra[key];
    }

    if (paramsExtraFix.ads_ad_unit_width === 'auto' || paramsExtraFix.ads_ad_unit_height === 'auto') {
      var obj = document.getElementById(objId);
      if (obj && obj.getBoundingClientRect) {
        obj.style.width  = '100%';
        obj.style.height = '100%';
        var rect = obj.getBoundingClientRect();
        obj.style.width  = '';
        obj.style.height = '';
        if (paramsExtraFix.ads_ad_unit_width === 'auto') {
          paramsExtraFix.ads_ad_unit_width = Math.floor(rect.right - rect.left);
          if (!paramsExtraFix.ads_ad_unit_width) {
            delete paramsExtraFix.ads_ad_unit_width;
          }
        }
        if (paramsExtraFix.ads_ad_unit_height === 'auto') {
          paramsExtraFix.ads_ad_unit_height = Math.floor(rect.bottom - rect.top);
          if (!paramsExtraFix.ads_ad_unit_height) {
            delete paramsExtraFix.ads_ad_unit_height;
          }
        }
      }
      if (paramsExtraFix.ads_ad_unit_width === 'auto') {
        delete paramsExtraFix.ads_ad_unit_width;
      }
      if (paramsExtraFix.ads_ad_unit_height === 'auto') {
        delete paramsExtraFix.ads_ad_unit_height;
      }
    }

    var width           = (paramsExtraFix && parseInt(paramsExtraFix.ads_ad_unit_width) || 100);
    var height          = (paramsExtraFix && parseInt(paramsExtraFix.ads_ad_unit_height) || 100);
    var handler         = paramsExtraFix.ads_handler;
    var handlerFailOnly = !!paramsExtraFix.ads_handler_fail_only;
    delete paramsExtraFix.ads_handler;
    delete paramsExtraFix.ads_handler_fail_only;

    params.act = 'ads_web';
    params.url = location.href;
    VK.extend(params, paramsExtraFix);

    options.noDefaultParams   = true;
    options.width             = width;
    options.allowTransparency = true;
    defaults.startHeight = height;
    defaults.minWidth    = width;
    funcs.adsOnInit       = adsOnInit;
    funcs.adsCheckVisible = adsCheckVisible;
    funcs.adsAddEvents    = adsAddEvents;

    return VK.Widgets._constructor('ads_rotate.php', objId, options, params, funcs, defaults, onDone);

    function adsOnInit() {
      if (options.onAdsReady) options.onAdsReady.apply(options.onAdsReady, Array.prototype.slice.call(arguments));
      var errorCode = arguments[0];
      if (!handlerFailOnly || errorCode <= 0) {
        adsEvalHandler(handler, errorCode);
      }
    }
    function adsCheckVisible(oneAdMaxWidth, oneAdMaxHeight) {
      var isVisibleAds = true;
      var windowWidth  = Math.max(parseInt(window.innerWidth) || 0, parseInt(document.documentElement.clientWidth) || 0);
      var windowHeigth = Math.max(parseInt(window.innerHeight) || 0, parseInt(document.documentElement.clientHeight) || 0);
      if (iframe.getBoundingClientRect) {
        var iframeRect     = iframe.getBoundingClientRect();
        var firstAdCenterX = iframeRect.left + oneAdMaxWidth * 0.5;
        var firstAdCenterY = iframeRect.top + oneAdMaxHeight * 0.5;
        isVisibleAds       = (isVisibleAds && firstAdCenterX > 0 && firstAdCenterX < windowWidth);
        isVisibleAds       = (isVisibleAds && firstAdCenterY > 0 && firstAdCenterY < windowHeigth);
        if (document.elementFromPoint && oneAdMaxWidth && oneAdMaxHeight) {
          isVisibleAds = (isVisibleAds && document.elementFromPoint(firstAdCenterX, firstAdCenterY) === iframe);
        }
      }
      rpc.callMethod('onAdsCheckVisibleResult', isVisibleAds);
    }
    function adsAddEvents(adsScriptVersion) {
      VK.Observer.subscribe('ads.onHasFocus',                function(){ rpc.callMethod('onAdsHasFocus'); })
      VK.Observer.subscribe('ads.onFocusWindow',             function(){ rpc.callMethod('onAdsFocusWindow'); })
      VK.Observer.subscribe('ads.onBlurWindow',              function(){ rpc.callMethod('onAdsBlurWindow'); })
      VK.Observer.subscribe('ads.onMouseDownDocument',       function(){ rpc.callMethod('onAdsMouseDownDocument'); })
      VK.Observer.subscribe('ads.onMouseDownDocumentAction', function(){ rpc.callMethod('onAdsMouseDownDocumentAction'); })

      adsAttachScript(adsScriptVersion);
    }
    function adsAttachScript(adsScriptVersion) {
      if (window.vk__adsLight) {
        if (vk__adsLight.onInit) {
          vk__adsLight.onInit();
        }
      } else {
        adsScriptVersion = parseInt(adsScriptVersion);
        var attachScriptFucn = (VK.Api && VK.Api.attachScript || VK.addScript);
        var base_domain = (options.base_domain || VK._protocol + '//vk.com');
        attachScriptFucn(base_domain + '/js/al/aes_light.js?' + adsScriptVersion);
      }
    }
    function adsEvalHandler(handler) {
      try {
        if (!handler) {
          return;
        }
        var func = false;
        if (isFunction(handler)) {
          func = handler;
        } else if (isString(handler)) {
          var handlerFuncs = handler.split('.');
          func = window;
          for (var i = 0, len = handlerFuncs.length; i < len; i++) {
            func = func[handlerFuncs[i]];
            if (!func) {
              break;
            }
          }
          if (!func) {
            var handlerResult = (new Function(handler))();
            if (isFunction(handlerResult)) {
              func = handlerResult;
            }
          }
        }
        if (func) {
          var args = Array.prototype.slice.call(arguments, 1);
          func.apply(func, args);
        }
      } catch (e) {
        try {
          console.error(e);
        } catch (e2) {}
      }
      function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
      }
      function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
      }
    }
    function indexOf(arr, value, from) {
      for (var i = from || 0, l = (arr || []).length; i < l; i++) {
        if (arr[i] == value) return i;
      }
      return -1;
    }
    function inArray(value, arr) {
      return indexOf(arr, value) != -1;
    }
    function onDone(o, i, r) {
      iframe = i;
      rpc = r;
    }
  };

  VK.Widgets._constructor = function(widgetUrl, objId, options, params, funcs, defaults, onDone, widgetId, iter) {
    var obj = document.getElementById(objId);
    widgetId = widgetId || (++VK.Widgets.count);

    if (!obj) {
      iter = iter || 0;
      if (iter > 10) {
        throw Error('VK.Widgets: object #' + objId + ' not found.');
      }
      setTimeout(function () {
        VK.Widgets._constructor(widgetUrl, objId, options, params, funcs, defaults, onDone, widgetId, iter + 1);
      }, 500);
      return widgetId;
    }

    var ifr, base_domain, width, url, urlQueryString, encodedParam, rpc, iframe, i;
    options = options || {};
    defaults = defaults || {};
    funcs = funcs || {};

    base_domain = options.base_domain || VK._protocol + '//vk.com';
    width = (options.width == 'auto') ? obj.clientWidth || '100%' : parseInt(options.width, 10);

    if (options.height) {
      params.height = options.height;
      obj.style.height = options.height + 'px';
    } else {
      obj.style.height = (defaults.startHeight || 200) + 'px';
    }

    width = width ? (Math.max(defaults.minWidth || 200, Math.min(10000, width)) + 'px') : '100%';

    if (!params.url) {
      params.url = options.pageUrl || location.href.replace(/#.*$/, '');
    }
    url = base_domain + '/' + widgetUrl;
    urlQueryString = '';
    if (!options.noDefaultParams) {
      urlQueryString += '&app=' + (VK._apiId || '0') + '&width=' + width
    }
    if (VK._iframeAppWidget) {
      params.iframe_app = 1;
    }
    for (i in params) {
      if (i == 'title' && params[i].length > 80) params[i] = params[i].substr(0, 80)+'...';
      if (i == 'description' && params[i].length > 160) params[i] = params[i].substr(0, 160)+'...';
      if (typeof(params[i]) == 'number') {
        encodedParam = params[i];
      } else {
        try {
          encodedParam = encodeURIComponent(params[i]);
        } catch (e) {
          encodedParam = '';
        }
      }
      urlQueryString += '&' + i + '=' + encodedParam;
    }
    urlQueryString += '&' + (+new Date()).toString(16);
    url += '?' + urlQueryString.substr(1);

    obj.style.width = width;
    VK.Widgets.loading(obj, true);

    funcs.publish = function () {
      var args = Array.prototype.slice.call(arguments);
      args.push(widgetId);
      VK.Observer.publish.apply(VK.Observer, args);
    };
    funcs.onInit = function() {
      VK.Widgets.loading(obj, false);
      if (funcs.onReady) funcs.onReady();
      if (options.onReady) options.onReady();
    }
    funcs.resize = function(e, cb) {
      obj.style.height = e + 'px';
      var el = document.getElementById('vkwidget' + widgetId);
      if (el) {
        el.style.height = e + 'px';
      }
    }
    funcs.resizeWidget = function(newWidth, newHeight) {
      newWidth  = parseInt(newWidth);
      newHeight = parseInt(newHeight);
      var widgetElem = document.getElementById('vkwidget' + widgetId);
      if (isFinite(newWidth)) {
        obj.style.width = newWidth + 'px';
        if (widgetElem) {
          widgetElem.style.width = newWidth + 'px';
        }
      }
      if (isFinite(newHeight)) {
        obj.style.height = newHeight + 'px';
        if (widgetElem) {
          widgetElem.style.height = newHeight + 'px';
        }
      }
      if (options.onResizeWidget) options.onResizeWidget();
    }
    rpc = VK.Widgets.RPC[widgetId] = new fastXDM.Server(funcs, function(origin) {
      if (!origin) return true;
      origin = origin.toLowerCase();
      return (origin.indexOf('.vk.com') != -1 || origin.indexOf('/vk.com') != -1);
    });
    iframe = VK.Widgets.RPC[widgetId].append(obj, {
      src: url,
      width: (width.indexOf('%') != -1) ? width : (parseInt(width) || width),
      height: defaults.startHeight || '100%',
      scrolling: 'no',
      id: 'vkwidget' + widgetId,
      allowTransparency: options.allowTransparency || false,
      style: {
        overflow: 'hidden'
      }
    });
    onDone && setTimeout(function () {onDone(obj, iframe || obj.firstChild, rpc);}, 10);
    return widgetId;
  };
}

if (!VK.Util) {
VK.Util = {
  getPageData: function () {
    if (!VK._pData) {
      var metas = document.getElementsByTagName('meta'), pData = {}, keys = ['description', 'title', 'url', 'image', 'app_id'], metaName;
      for (var i in metas) {
        if (!metas[i].getAttribute) continue;
        if (metas[i].getAttribute && ((metaName = metas[i].getAttribute('name')) || (metaName = metas[i].getAttribute('property')))) {
          for (var j in keys) {
            if (metaName == keys[j] || metaName == 'og:'+keys[j] || metaName == 'vk:'+keys[j]) {
              pData[keys[j]] = metas[i].content;
            }
          }
        }
      }
      if (pData.app_id && !VK._apiId) {
        VK._apiId = pData.app_id;
      }
      pData.title = pData.title || document.title || '';
      pData.description = pData.description || '';
      pData.image = pData.image || '';
      if (!pData.url && VK._iframeAppWidget && VK._apiId) {
        pData.url = '/app' + VK._apiId;
        if (VK._browserHash) {
          pData.url += VK._browserHash
        }
      }
      var loc = location.href.replace(/#.*$/, '');
      if (!pData.url || !pData.url.indexOf(loc)) {
        pData.url = loc;
      }
      VK._pData = pData;
    }
    return VK._pData;
  },
  getXY: function (obj, fixed) {
   if (!obj || obj === undefined) return;
   var left = 0, top = 0;
   if (obj.offsetParent) {
    do {
      left += obj.offsetLeft;
      top += obj.offsetTop;
      if (fixed) {
        left -= obj.scrollLeft;
        top -= obj.scrollTop;
      }
    } while (obj = obj.offsetParent);
   }
   if (fixed) {
     top += window.pageYOffset || window.scrollNode && scrollNode.scrollTop || document.documentElement.scrollTop;
   }
   return [left,top];
  },
  Box: function (src, sizes, fnc, options) {
    fnc = fnc || {};
    var rpc = new fastXDM.Server(VK.extend(fnc, {
      onInit: function () {
        iframe.style.background = 'transparent';
      },
      hide: function () {
        iframe.style.display = 'none';
      },
      destroy: function () {
        try {
          iframe.src = 'about: blank;';
        } catch (e) {}
        iframe.parentNode.removeChild(iframe);
      },
      resize: function (w, h) {
        sizes[0] = w;
        sizes[1] = h;
        VK.Util.ss(iframe, {width: sizes[0] + 'px', height: sizes[1] + 'px'});
        updateCoords();
      }
    }, true)),
    iframe = rpc.append(document.body, {
      src: src,
      scrolling: 'no',
      allowTransparency: true,
      style: {position: 'absolute', left: '50%', zIndex: 1002, background: VK._protocol + '//vk.com/images/upload.gif center center no-repeat transparent', padding: '0', border: '0', width: sizes[0] + 'px', height: sizes[1] + 'px', overflow: 'hidden'}
    }),
    updateCoords = function (scrollTop, height) {
        height = Math.min(1000, height || (window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight)));
        scrollTop = scrollTop || Math.max(parseInt(window.pageYOffset, 10) || 0, document.documentElement.scrollTop,  document.body.scrollTop);
        var top = Math.max(0, scrollTop + (height - sizes[1]) / 3);
        VK.Util.ss(iframe, {'top': top + 'px', margin: '0 0 0 ' + (-sizes[0]/2) + 'px'});
    };
    return {
      show: function (scrollTop, height) {
        updateCoords(scrollTop, height);
        iframe.style.display = 'block';
      },
      hide: function () {
        iframe.style.display = 'none';
      },
      iframe: iframe,
      rpc: rpc
    }
  },
  addEvent: function(type, func) {
    if (window.document.addEventListener) {
      window.document.addEventListener(type, func, false);
    } else if (window.document.attachEvent) {
      window.document.attachEvent('on'+type, func);
    }
  },
  removeEvent: function(type, func) {
    if (window.document.removeEventListener) {
      window.document.removeEventListener(type, func, false);
    } else if (window.document.detachEvent) {
      window.document.detachEvent('on'+type, func);
    }
  },
  ss: function (el, styles) {VK.extend(el.style, styles, true);}
};
}

// Init asynchronous library loading
window.vkAsyncInit && setTimeout(vkAsyncInit, 0);

if (window.vkAsyncInitCallbacks && vkAsyncInitCallbacks.length) {
  setTimeout(function() {
    var callback;
    while (callback = vkAsyncInitCallbacks.pop()) {
      try {
        callback();
      } catch(e) {
        try {
          console.error(e);
        } catch (e2) {}
      }
    }
  }, 0);
}