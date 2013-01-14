window.addEventListener 'load', ->
  runner = mocha.run ->
    failures = runner.failures || 0
    total = runner.total || 0
    image = new Image()
    image.src = "/diediedie?failed=#{failures}&total=#{total}";
    image.onload = ->
      null

