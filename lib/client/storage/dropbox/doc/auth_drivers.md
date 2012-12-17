# Authentication Drivers

This document explains the structure and functionality of a `dropbox.js` OAuth
driver, and describes the drivers that ship with the library.

## The OAuth Driver Interface

An OAuth driver is a JavaScript object that implements the methods documented
in the
[Dropbox.AuthDriver class](http://coffeedoc.info/github/dropbox/dropbox-js/master/classes/Dropbox/AuthDriver.html).
This class exists solely for the purpose of documenting these methods.

A simple driver can get away with implementing `url` and `doAuthorize`. The
following example shows an awfully unusable node.js driver that asks the user
to visit the authorization URL in a browser.

```javascript
var util = require("util");
var simpleDriver = {
  url: function() { return ""; },
  doAuthorize: function(authUrl, token, tokenSecret, callback) {
    util.print("Visit the following in a browser, then press Enter\n" +
                authUrl + "\n");
    var onEnterKey = function() {
      process.stdin.removeListener("data", onEnterKey);
      callback(token);
    }
    process.stdin.addListener("data", onEnterKey);
    process.stdin.resume();
  }
};
```

Complex drivers can take control of the OAuth process by implementing
`onAuthStateChange`. Implementations of this method should read the `authState`
field of the `Dropbox.Client` instance they are given to make decisions.
Implementations should call the `credentials` and `setCredentials` methods on
the client to control the OAuth process.

See the
[Dropbox.Drivers.Redirect source](https://github.com/dropbox/dropbox-js/blob/master/src/drivers.coffee)
for a sample implementation of `onAuthStateChange`.


### The OAuth Process Steps

The `authenticate` method in `Dropbox.Client` implements the OAuth process as a
finite state machine (FSM). The current state is available in the `authState`
field.

The authentication FSM has the following states.

* `Dropbox.Client.RESET` is the initial state, where the client has no OAuth
tokens; after `onAuthStateChange` is triggered, the client will attempt to
obtain an OAuth request token
* `Dropbox.Client.REQUEST` indicates that the client has obtained an OAuth
request token; after `onAuthStateChange` is triggered, the client will call
`doAuthorize` on the OAuth driver, to get the OAuth request token authorized by
the user
* `Dropbox.Client.AUTHORIZED` is reached after the `doAuthorize` calls its
callback, indicating that the user has authorized the OAuth request token;
after `onAuthStateChange` is triggered, the client will attempt to exchange the
request token for an OAuth access token
* `Dropbox.Client.DONE` indicates that the OAuth process has completed, and the
client has an OAuth access token that can be used in API calls; after
`onAuthStateChange` is triggered, `authorize` will call its callback function,
and report success
* `Dropbox.Client.SIGNED_OFF` is reached when the client's `signOut` method is
called, after the API call succeeds; after `onAuthStateChange` is triggered,
`signOut` will call its callback function, and report success
* `Dropbox.Client.ERROR` is reached if any of the Dropbox API calls used by
`authorize` or `signOut` results in an error; after `onAuthStateChange` is
triggered, `authorize` or `signOut` will call its callback function and report
the error


## Built-in OAuth Drivers

`dropbox.js` ships with the OAuth drivers below.

### Dropbox.Drivers.Redirect

The recommended built-in driver for browser applications completes the OAuth
token authorization step by redirecting the browser to the Dropbox page that
performs the authorization and having that page redirect back to the
application page.

This driver's constructor takes the following options.

* `useQuery` should be set to true for applications that use the URL fragment
(the part after `#`) to store state information
* `rememberUser` can be set to true to have the driver store the user's OAuth
token in `localStorage`, so the user doesn't have to authorize the application
on every request

Although it seems that `rememberUser` should be true by default, it brings a
couple of drawbacks. The user's token will still be valid after signing off the
Dropbox web site, so your application will still recognize the user and access
their Dropbox. This behavior is unintuitive to users. A reasonable compromise
for apps that use `rememberUser` is to provide a `Sign out` button that calls
the `signOut` method on the app's `Dropbox.Client` instance.

The
[checkbox.js](https://github.com/dropbox/dropbox-js/tree/master/samples/checkbox.js)
sample application uses `rememberUser`, and implements signing off as described
above.


### Dropbox.Drivers.Popup

This driver may be useful for browser applications that can't handle the
redirections peformed by `Dropbox.Drivers.Redirect`. This driver avoids
changing the location of the application's browser window by popping up a
separate window, and loading the Dropbox authorization page in that window.

The popup method has a couple of serious drawbacks. Most browsers will not
display the popup window by default, and instead will show a hard-to-notice
warning that the user must interact with to display the popup. The driver's
code for communicating between the popup and the main application window does
not work on IE9 and below, so applications that use it will only work on
Chrome, Firefox and IE10+.

If the drawbacks above are more acceptable than restructuring your application
to handle redirects, create a page on your site that contains the
[receiver code](https://github.com/dropbox/dropbox-js/blob/master/test/html/oauth_receiver.html),
and point the `Dropbox.Drivers.Popup` constructor to it.

```javascript
client.authDriver(new Dropbox.Drivers.Popup({receiverUrl: "https://url.to/receiver.html"}));
```

The popup driver adds a `#` (fragment hash) to the receiver URL if necessary,
to ensure that the user's Dropbox uid and OAuth token are passed to the
receiver in a URL fragment. This measure may improve your users' privacy, as it
reduces the chance that their uid or token ends up in a server log.

If you have a good reason to disable the behavior above, set the `noFragment`
option to true.

```javascript
client.authDriver(new Dropbox.Drivers.Popup({receiverUrl: "https://url.to/receiver.html", noFragment: true}));
```


### Dropbox.Drivers.NodeServer

This driver is designed for use in the automated test suites of node.js
applications. It completes the OAuth token authorization step by opening the
Dropbox authorization page in a new browser window, and "catches" the OAuth
redirection by setting up a small server using the `https` built-in node.js
library.

The driver's constructor takes the following options.

* `port` is the HTTP port number; the default is 8192, and works well with the
Chrome extension described below
* `favicon` is a path to a file that will be served in response to requests to
`/favicon.ico`; setting this to a proper image will avoid some warnings in the
browsers' consoles

To fully automate your test suite, you need to load up the Chrome extension
bundled in the `dropbox.js` source tree. The extension automatically clicks on
the "Authorize" button in the Dropbox token authorization page, and closes the
page after the token authorization process completes. Follow the steps in the
[development guide](https://github.com/dropbox/dropbox-js/blob/master/doc/development.md)
to build and install the extension.

