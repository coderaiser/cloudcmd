# Getting Started

This is a guide to writing your first dropbox.js application.


## Library Setup

This section describes how to get the library hooked up into your application.

### Browser Applications

To get started right away, place this snippet in your page's `<head>`.

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.7.1/dropbox.min.js">
</script>
```

The snippet is not a typo. [cdnjs](https://cdnjs.com) recommends using
[protocol-relative URLs](http://paulirish.com/2010/the-protocol-relative-url/).

To get the latest development build of dropbox.js, follow the steps in the
[development guide](https://github.com/dropbox/dropbox-js/blob/master/doc/development.md).


#### "Powered by Dropbox" Static Web Apps

Before writing any source code, use the
[console app](https://dl-web.dropbox.com/spa/pjlfdak1tmznswp/powered_by.js/public/index.html)
to set up your Dropbox. After adding an application, place the source code at
`/Apps/Static Web Apps/my_awesome_app/public`. You should find a pre-generated
`index.html` file in there.

### node.js Applications

First, install the `dropbox` [npm](https://npmjs.org/) package.

```bash
npm install dropbox
```

Once the npm package is installed, the following `require` statement lets you
access the same API as browser applications

```javascript
var Dropbox = require("dropbox");
```


## Initialization

[Register your application](https://www.dropbox.com/developers/apps) to obtain
an API key. Read the brief
[API core concepts intro](https://www.dropbox.com/developers/start/core).

Once you have an API key, use it to create a `Dropbox.Client`.

```javascript
var client = new Dropbox.Client({
    key: "your-key-here", secret: "your-secret-here", sandbox: true
});
```

If your application requires full Dropbox access, leave out the `sandbox: true`
parameter.


### Browser and Open-Source Applications

The Dropbox API guidelines ask that the API key and secret is never exposed in
cleartext. This is an issue for browser-side and open-source applications.

To meet this requirement,
[encode your API key](https://dl-web.dropbox.com/spa/pjlfdak1tmznswp/api_keys.js/public/index.html)
and pass the encoded key string to the `Dropbox.Client` constructor.

```javascript
var client = new Dropbox.Client({
    key: "encoded-key-string|it-is-really-really-long", sandbox: true
});
```


## Authentication

Before you can make any API calls, you need to authenticate your application's
user with Dropbox, and have them authorize your app's to access their Dropbox.

This process follows the [OAuth 1.0](http://tools.ietf.org/html/rfc5849)
protocol, which entails sending the user to a Web page on `www.dropbox.com`,
and then having them redirected back to your application. Each Web application
has its requirements, so `dropbox.js` lets you customize the authentication
process by implementing an
[OAuth driver](https://github.com/dropbox/dropbox-js/blob/master/src/drivers.coffee).

At the same time, dropbox.js ships with a couple of OAuth drivers, and you
should take advantage of them as you prototype your application.

Read the
[authentication doc](https://github.com/dropbox/dropbox-js/blob/master/doc/auth_drivers.md)
for further information about writing an OAuth driver, and to learn about all
the drivers that ship with `dropbox.js`.

### Browser Setup

The following snippet will set up the recommended driver.

```javascript
client.authDriver(new Dropbox.Drivers.Redirect());
```

The
[authentication doc](https://github.com/dropbox/dropbox-js/blob/master/doc/auth_drivers.md)
describes some useful options that you can pass to the
`Dropbox.Drivers.Redirect` constructor.

### node.js Setup

Single-process node.js applications should create one driver to authenticate
all the clients.

```javascript
client.authDriver(new Dropbox.Drivers.NodeServer(8191));
```

The
[authentication doc](https://github.com/dropbox/dropbox-js/blob/master/doc/auth_drivers.md)
has useful tips on using the `NodeServer` driver.

### Shared Code

After setting up an OAuth driver, authenticating the user is one method call
away.

```javascript
client.authenticate(function(error, client) {
  if (error) {
    // Replace with a call to your own error-handling code.
    //
    // Don't forget to return from the callback, so you don't execute the code
    // that assumes everything went well.
    return showError(error);
  }

  // Replace with a call to your own application code.
  //
  // The user authorized your app, and everything went well.
  // client is a Dropbox.Client instance that you can use to make API calls.
  doSomethingCool(client);
});
```

## Error Handlng

When Dropbox API calls fail, dropbox.js methods pass a `Dropbox.Error` instance
as the first parameter in their callbacks. This parameter is named `error` in
all the code snippets on this page.

If `error` is a truthy value, you should either recover from the error, or
notify the user that an error occurred. The `status` field in the
`Dropbox.Error` instance contains the HTTP error code, which should be one of
the
[error codes in the REST API](https://www.dropbox.com/developers/reference/api#error-handling).

The snippet below is a template for an extensive error handler.

```javascript
var showError = function(error) {
  if (window.console) {  // Skip the "if" in node.js code.
    console.error(error);
  }

  switch (error.status) {
  case 401:
    // If you're using dropbox.js, the only cause behind this error is that
    // the user token expired.
    // Get the user through the authentication flow again.
    break;

  case 404:
    // The file or folder you tried to access is not in the user's Dropbox.
    // Handling this error is specific to your application.
    break;

  case 507:
    // The user is over their Dropbox quota.
    // Tell them their Dropbox is full. Refreshing the page won't help.
    break;

  case 503:
    // Too many API requests. Tell the user to try again later.
    // Long-term, optimize your code to use fewer API calls.
    break;

  case 400:  // Bad input parameter
  case 403:  // Bad OAuth request.
  case 405:  // Request method not expected
  default:
    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
    // Tell the user an error occurred, ask them to refresh the page.
  }
};
```


## The Fun Part

Authentication was the hard part of the API integration, and error handling was
the most boring part. Now that these are both behind us, you can interact
with the user's Dropbox and focus on coding up your application!

The following sections have some commonly used code snippets. The
[Dropbox.Client API reference](http://coffeedoc.info/github/dropbox/dropbox-js/master/classes/Dropbox/Client.html)
will help you navigate less common scenarios, and the
[Dropbox REST API reference](https://www.dropbox.com/developers/reference/api)
describes the underlying HTTP protocol, and can come in handy when debugging
your application, or if you want to extend dropbox.js.

### User Info

```javascript
client.getUserInfo(function(error, userInfo) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("Hello, " + userInfo.name + "!");
});
```

### Write a File

```javascript
client.writeFile("hello_world.txt", "Hello, world!\n", function(error, stat) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("File saved as revision " + stat.revisionTag);
});
```

### Read a File

```javascript
client.readFile("hello_world.txt", function(error, data) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert(data);  // data has the file's contents
});
```

### List a Directory's Contents

```javascript
client.readdir("/", function(error, entries) {
  if (error) {
    return showError(error);  // Something went wrong.
  }

  alert("Your Dropbox contains " + entries.join(", "));
});
```

### Sample Applications

Check out the
[sample apps](https://github.com/dropbox/dropbox-js/tree/master/samples)
to see how all these concepts play out together.

