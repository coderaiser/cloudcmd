describe 'Dropbox.EventSource', ->
  beforeEach ->
    @source = new Dropbox.EventSource
    @cancelable = new Dropbox.EventSource cancelable: true

    # 3 listeners, 1 and 2 are already hooked up
    @event1 = null
    @return1 = true
    @listener1 = (event) =>
      @event1 = event
      @return1
    @source.addListener @listener1
    @cancelable.addListener @listener1
    @event2 = null
    @return2 = false
    @listener2 = (event) =>
      @event2 = event
      @return2
    @source.addListener @listener2
    @cancelable.addListener @listener2
    @event3 = null
    @return3 = true
    @listener3 = (event) =>
      @event3 = event
      @return3

  describe '#addListener', ->
    it 'adds a new listener', ->
      @source.addListener @listener3
      expect(@source._listeners).to.deep.
          equal [@listener1, @listener2, @listener3]

    it 'does not add an existing listener', ->
      @source.addListener @listener2
      expect(@source._listeners).to.deep.equal [@listener1, @listener2]

    it 'is idempotent', ->
      @source.addListener @listener3
      @source.addListener @listener3
      expect(@source._listeners).to.deep.
          equal [@listener1, @listener2, @listener3]

    it 'refuses to add non-functions', ->
      expect(=> @source.addListener 42).to.throw(TypeError, /listener type/)

  describe '#removeListener', ->
    it 'does nothing for a non-existing listener', ->
      @source.removeListener @listener3
      expect(@source._listeners).to.deep.equal [@listener1, @listener2]

    it 'removes a listener at the end of the queue', ->
      @source.removeListener @listener2
      expect(@source._listeners).to.deep.equal [@listener1]

    it 'removes a listener at the beginning of the queue', ->
      @source.removeListener @listener1
      expect(@source._listeners).to.deep.equal [@listener2]

    it 'removes a listener at the middle of the queue', ->
      @source.addListener @listener3
      @source.removeListener @listener2
      expect(@source._listeners).to.deep.equal [@listener1, @listener3]

    it 'removes all the listeners', ->
      @source.removeListener @listener1
      @source.removeListener @listener2
      expect(@source._listeners).to.deep.equal []

    describe 'without ES5 Array#indexOf', ->
      beforeEach ->
        @source._listeners.indexOf = null

      afterEach ->
        delete @source._listeners.indexOf

      assertArraysEqual = (array1, array2) ->
        expect(array1.length).to.equal(array2.length)
        for i in [0...array1.length]
          expect(array1[i]).to.equal(array2[i])

      it 'does nothing for a non-existing listener', ->
        @source.removeListener @listener3
        assertArraysEqual @source._listeners, [@listener1, @listener2]

      it 'removes a listener at the end of the queue', ->
        @source.removeListener @listener2
        assertArraysEqual @source._listeners, [@listener1]

      it 'removes a listener at the beginning of the queue', ->
        @source.removeListener @listener1
        assertArraysEqual @source._listeners, [@listener2]

      it 'removes a listener at the middle of the queue', ->
        @source.addListener @listener3
        @source.removeListener @listener2
        assertArraysEqual @source._listeners, [@listener1, @listener3]

      it 'removes all the listeners', ->
        @source.removeListener @listener1
        @source.removeListener @listener2
        assertArraysEqual @source._listeners, []

  describe '#dispatch', ->
    beforeEach ->
      @event = { answer: 42 }

    it 'passes event to all listeners', ->
      @source.dispatch @event
      expect(@event1).to.equal @event
      expect(@event2).to.equal @event
      expect(@event3).to.equal null

    describe 'on non-cancelable events', ->
      beforeEach ->
        @source.addListener @listener3
        @returnValue = @source.dispatch @event

      it 'calls all the listeners', ->
        expect(@event1).to.equal @event
        expect(@event2).to.equal @event
        expect(@event3).to.equal @event

      it 'ignores the listener return values', ->
        expect(@returnValue).to.equal true

    describe 'on cancelable events', ->
      beforeEach ->
        @cancelable.addListener @listener3
        @returnValue = @cancelable.dispatch @event

      it 'stops calling listeners after cancelation', ->
        expect(@event1).to.equal @event
        expect(@event2).to.equal @event
        expect(@event3).to.equal null

      it 'reports cancelation', ->
        expect(@returnValue).to.equal false

      it 'calls all listeners if no cancelation occurs', ->
        @return2 = true
        @returnValue = @cancelable.dispatch @event

        expect(@returnValue).to.equal true
        expect(@event3).to.equal @event
