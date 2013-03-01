# Event dispatch following a publisher-subscriber (PubSub) model.
class Dropbox.EventSource
  # Sets up an event source (publisher).
  #
  # @param {?Object} options one or more of the options below
  # @option options {Boolean} cancelable if true,
  constructor: (options) ->
    @_cancelable = options and options.cancelable
    @_listeners = []

  # Registers a listener (subscriber) to events coming from this source.
  #
  # This is a simplified version of the addEventListener DOM API. Listeners
  # must be functions, and they can be removed by calling removeListener.
  #
  # This method is idempotent, so a function will not be added to the list of
  # listeners if was previously added.
  #
  # @param {function(Object)} listener called every time an event is fired; if
  #   the event is cancelable, the function can return false to cancel the
  #   event, or any other value to allow it to propagate; the return value is
  #   ignored for non-cancelable events
  # @return {Dropbox.EventSource} this, for easy call chaining
  addListener: (listener) ->
    unless typeof listener is 'function'
      throw new TypeError 'Invalid listener type; expected function'
    unless listener in @_listeners
      @_listeners.push listener
    @

  # Un-registers a listener (subscriber) previously added by addListener.
  #
  # This is a simplified version of the removeEventListener DOM API. The
  # listener must be exactly the same object supplied to addListener.
  #
  # This method is idempotent, so it will fail silently if the given listener
  # is not registered as a subscriber.
  #
  # @param {function(Object)} listener function that was previously passed in
  #   an addListener call
  # @return {Dropbox.EventSource} this, for easy call chaining
  removeListener: (listener) ->
    if @_listeners.indexOf
      # IE9+
      index = @_listeners.indexOf listener
      @_listeners.splice index, 1 if index isnt -1
    else
      # IE8 doesn't implement Array#indexOf in ES5.
      for subscriber, i in @_listeners
        if subscriber is listener
          @_listeners.splice i, 1
          break
    @


  # Informs the listeners (subscribers) that an event occurred.
  #
  # Event sources configured for non-cancelable events call all listeners in an
  # unspecified order. Sources configured for cancelable events stop calling
  # listeners as soon as one listener returns false value.
  #
  # @param {Object} event passed to all the registered listeners
  # @return {Boolean} sources of cancelable events return false if the event
  #   was canceled and true otherwise; sources of non-cancelable events always
  #   return true
  dispatch: (event) ->
    for listener in @_listeners
      returnValue = listener event
      if @_cancelable and returnValue is false
        return false
    true
