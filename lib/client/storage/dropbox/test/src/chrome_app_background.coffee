chrome.app.runtime.onLaunched.addListener ->
  chrome.app.window.create 'test/html/browser_test.html',
      type: 'shell', frame: 'chrome', id: 'test_suite'
