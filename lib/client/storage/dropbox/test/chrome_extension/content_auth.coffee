# Content script for Dropbox authorization pages.

message = type: 'auth', url: window.location.href
chrome.extension.sendMessage message, (response) ->
  return unless response.automate

  button = document.querySelector('[name=allow_access]') or
           document.querySelector '.freshbutton-blue'
  event = document.createEvent 'MouseEvents'

  clientX = button.clientWidth / 2
  clientY = button.clientHeight / 2
  screenX = window.screenX + button.offsetLeft + clientX
  screenY = window.screenY + button.offsetTop + clientY
  event.initMouseEvent 'click', true, true, window, 1,
    screenX, screenY, clientX, clientY, false, false, false, false, 0, null
  button.dispatchEvent event

