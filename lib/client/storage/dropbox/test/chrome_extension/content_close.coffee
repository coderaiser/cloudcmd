# Content script for Dropbox OAuth receiver pages.

message = type: 'close', url: window.location.href
chrome.extension.sendMessage message
