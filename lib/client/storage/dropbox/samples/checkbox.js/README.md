# Checkbox, a dropbox.js Sample Application

This application demonstrates the use of the JavaScript client library for the
Dropbox API to implement a Dropbox-backed To Do list application.

In 70 lines of HTML, and 250 lines of commented CoffeeScript, Checkbox lets you
store your To Do list in your Dropbox! Just don't expect award winning design
or usability from a sample application.

See this sample in action
[here](https://dl-web.dropbox.com/spa/pjlfdak1tmznswp/checkbox.js/public/index.html).


## Dropbox Integration

This proof-of-concept application uses the "App folder" Dropbox access level,
so Dropbox automatically creates a directory for its app data in the users'
Dropboxes. The data model optimizes for ease of development and debugging.
Each task is stored as a file whose name is the task’s description. Tasks are
grouped under two folders, active and done.

The main advantage of this data model is that operations on tasks cleanly map
to file operations in Dropbox. At initialization time, the application creates
its two folders, active and done. A task is created by writing an empty string
to a file in the active folder, marked as completed by moving the file to the
done folder, and removed by deleting the associated file.

The lists of tasks are obtained by listing the contents of the active and done
folders. The data model can be easily extended, by storing JSON-encoded
information, such as deadlines, in the task files.

This sample uses the following `Dropbox.Client` methods:

* authenticate
* signOff
* getUserInfo
* mkdir
* readdir
* writeFile
* move
* remove


## Building

This sample does not require building. Follow the steps below to get your own
copy of the sample that you can hack on.

1. [Create a powered_by.js app in your Dropbox](https://dl-web.dropbox.com/spa/pjlfdak1tmznswp/powered_by.js/public/index.html).
1. [Get your own API key](https://www.dropbox.com/developers/apps).
1. [Encode your API key](https://dl-web.dropbox.com/spa/pjlfdak1tmznswp/api_keys.js/public/index.html).
1. Copy the source code to `/Apps/Static Web Apps/powered_by.js` in your Dropbox

## Dependencies

The application uses the following JavaScript libraries.

* [dropbox.js](https://github.com/dropbox/dropbox-js) for Dropbox integration
* [less](http://lesscss.org/) for CSS conciseness
* [CoffeeScript](http://coffeescript.org/) for JavaScript conciseness
* [jQuery](http://jquery.com/) for cross-browser compatibitility

The icons used in the application are all from
[the noun project](http://thenounproject.com/).

The application follows a good practice of packaging its dependencies, and not
hot-linking them.
