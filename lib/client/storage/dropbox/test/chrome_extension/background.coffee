# Background script orchestrating the dropbox.js testing automation.

class Automator
  constructor: ->
    @wired = false
    chrome.storage.sync.get 'enabled', (values) =>
      @lifeSwitch values.enabled is 'true'

  # Activates or deactivates the extension.
  # @param {Boolean} enabled if true, the extension's functionality is enabled
  lifeSwitch: (enabled) ->
    if enabled
      chrome.browserAction.setIcon
        path:
          19: 'images/action_on19.png'
          38: 'images/action_on38.png'
      chrome.browserAction.setTitle title: '(on) dropbox.js Test Automator'
      @wire()
    else
      chrome.browserAction.setIcon
        path:
          19: 'images/action_off19.png',
          38: 'images/action_off38.png'
      chrome.browserAction.setTitle title: '(off) dropbox.js Test Automator'
      @unwire()

  # Checks if Dropbox's authorization dialog should be auto-clicked.
  # @param {String} url the URL of the Dropbox authorization dialog
  # @return {Boolean} true if the "Authorize" button should be auto-clicked
  shouldAutomateAuth: (url) ->
    return false unless @wired
    !!(/(\?|&)oauth_callback=https?%3A%2F%2Flocalhost%3A891[12]%2F/.exec(url))

  # Checks if an OAuth receiver window should be auto-closed.
  # @param {String} url the URL of the OAuth receiver window
  # @return {Boolean} true if the "Authorize" button should be auto-clicked
  shouldAutomateClose: (url) ->
    return false unless @wired
    !!(/^https?:\/\/localhost:8912\/oauth_callback\?/.exec(url))

  # Sets up all the features that make dropbox.js testing easier.
  wire: ->
    return if @wired
    chrome.contentSettings.popups.set(
        primaryPattern: 'http://localhost:8911/*', setting: 'allow')
    @wired = true
    @

  # Disables the features that automate dropbox.js testing.
  unwire: ->
    return unless @wired
    chrome.contentSettings.popups.clear({})
    @wired = false
    @

# Global Automator instance.
automator = new Automator()

# Current extension id, used to validate incoming messages.
extensionId = chrome.i18n.getMessage "@@extension_id"

# Communicates with content scripts.
chrome.extension.onMessage.addListener (message, sender, sendResponse) ->
  return unless sender.id is extensionId
  switch message.type
    when 'auth'
      sendResponse automate: automator.shouldAutomateAuth(message.url)
    when 'close'
      if automator.shouldAutomateClose(message.url) and sender.tab
        chrome.tabs.remove sender.tab.id

# Listen to pref changes and activate / deactivate the extension.
chrome.storage.onChanged.addListener (changes, namespace) ->
  return unless namespace is 'sync'
  for name, change of changes
    continue unless name is 'enabled'
    automator.lifeSwitch change.newValue is 'true'

# The browser action item flips the switch that activates the extension.
chrome.browserAction.onClicked.addListener ->
  chrome.storage.sync.get 'enabled', (values) ->
    enabled = values.enabled is 'true'
    chrome.storage.sync.set enabled: (!enabled).toString()

