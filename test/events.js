var _ = require('underscore');
var Backbone = require('../backbone');
var assert = require('assert-expect');
describe('Events', function() {
  afterEach(function() {
    assert.finished();
  });

  it('on and trigger', function() {
    assert.expect(2);
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);
    obj.on('event', function() { obj.counter += 1; });
    obj.trigger('event');
    assert.equal(obj.counter, 1, 'counter should be incremented.');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    assert.equal(obj.counter, 5, 'counter should be incremented five times.');
  });

  it('binding and triggering multiple events', function() {
    assert.expect(4);
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);

    obj.on('a b c', function() { obj.counter += 1; });

    obj.trigger('a');
    assert.equal(obj.counter, 1);

    obj.trigger('a b');
    assert.equal(obj.counter, 3);

    obj.trigger('c');
    assert.equal(obj.counter, 4);

    obj.off('a c');
    obj.trigger('a b c');
    assert.equal(obj.counter, 5);
  });

  it('binding and triggering with event maps', function() {
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);

    var increment = function() {
      this.counter += 1;
    };

    obj.on({
      a: increment,
      b: increment,
      c: increment
    }, obj);

    obj.trigger('a');
    assert.equal(obj.counter, 1);

    obj.trigger('a b');
    assert.equal(obj.counter, 3);

    obj.trigger('c');
    assert.equal(obj.counter, 4);

    obj.off({
      a: increment,
      c: increment
    }, obj);
    obj.trigger('a b c');
    assert.equal(obj.counter, 5);
  });

  it('binding and triggering multiple event names with event maps', function() {
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);

    var increment = function() {
      this.counter += 1;
    };

    obj.on({
      'a b c': increment
    });

    obj.trigger('a');
    assert.equal(obj.counter, 1);

    obj.trigger('a b');
    assert.equal(obj.counter, 3);

    obj.trigger('c');
    assert.equal(obj.counter, 4);

    obj.off({
      'a c': increment
    });
    obj.trigger('a b c');
    assert.equal(obj.counter, 5);
  });

  it('binding and trigger with event maps context', function() {
    assert.expect(2);
    var obj = {counter: 0};
    var context = {};
    _.extend(obj, Backbone.Events);

    obj.on({
      a: function() {
        assert.strictEqual(this, context, 'defaults `context` to `callback` param');
      }
    }, context).trigger('a');

    obj.off().on({
      a: function() {
        assert.strictEqual(this, context, 'will not override explicit `context` param');
      }
    }, this, context).trigger('a');
  });

  it('listenTo and stopListening', function() {
    assert.expect(1);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenTo(b, 'all', function(){ assert.ok(true); });
    b.trigger('anything');
    a.listenTo(b, 'all', function(){ assert.ok(false); });
    a.stopListening();
    b.trigger('anything');
  });

  it('listenTo and stopListening with event maps', function() {
    assert.expect(4);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    var cb = function(){ assert.ok(true); };
    a.listenTo(b, {event: cb});
    b.trigger('event');
    a.listenTo(b, {event2: cb});
    b.on('event2', cb);
    a.stopListening(b, {event2: cb});
    b.trigger('event event2');
    a.stopListening();
    b.trigger('event event2');
  });

  it('stopListening with omitted args', function() {
    assert.expect(2);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    var cb = function() { assert.ok(true); };
    a.listenTo(b, 'event', cb);
    b.on('event', cb);
    a.listenTo(b, 'event2', cb);
    a.stopListening(null, {event: cb});
    b.trigger('event event2');
    b.off();
    a.listenTo(b, 'event event2', cb);
    a.stopListening(null, 'event');
    a.stopListening();
    b.trigger('event2');
  });

  it('listenToOnce', function() {
    assert.expect(2);
    // Same as the previous test, but we use once rather than having to explicitly unbind
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, Backbone.Events);
    var incrA = function(){ obj.counterA += 1; obj.trigger('event'); };
    var incrB = function(){ obj.counterB += 1; };
    obj.listenToOnce(obj, 'event', incrA);
    obj.listenToOnce(obj, 'event', incrB);
    obj.trigger('event');
    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
  });

  it('listenToOnce and stopListening', function() {
    assert.expect(1);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenToOnce(b, 'all', function() { assert.ok(true); });
    b.trigger('anything');
    b.trigger('anything');
    a.listenToOnce(b, 'all', function() { assert.ok(false); });
    a.stopListening();
    b.trigger('anything');
  });

  it('listenTo, listenToOnce and stopListening', function() {
    assert.expect(1);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenToOnce(b, 'all', function() { assert.ok(true); });
    b.trigger('anything');
    b.trigger('anything');
    a.listenTo(b, 'all', function() { assert.ok(false); });
    a.stopListening();
    b.trigger('anything');
  });

  it('listenTo and stopListening with event maps', function() {
    assert.expect(1);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenTo(b, {change: function(){ assert.ok(true); }});
    b.trigger('change');
    a.listenTo(b, {change: function(){ assert.ok(false); }});
    a.stopListening();
    b.trigger('change');
  });

  it('listenTo yourself', function() {
    assert.expect(1);
    var e = _.extend({}, Backbone.Events);
    e.listenTo(e, 'foo', function(){ assert.ok(true); });
    e.trigger('foo');
  });

  it('listenTo yourself cleans yourself up with stopListening', function() {
    assert.expect(1);
    var e = _.extend({}, Backbone.Events);
    e.listenTo(e, 'foo', function(){ assert.ok(true); });
    e.trigger('foo');
    e.stopListening();
    e.trigger('foo');
  });

  it('stopListening cleans up references', function() {
    assert.expect(12);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    var fn = function() {};
    b.on('event', fn);
    a.listenTo(b, 'event', fn).stopListening();
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn).stopListening(b);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn).stopListening(b, 'event');
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn).stopListening(b, 'event', fn);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
  });

  it('stopListening cleans up references from listenToOnce', function() {
    assert.expect(12);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    var fn = function() {};
    b.on('event', fn);
    a.listenToOnce(b, 'event', fn).stopListening();
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenToOnce(b, 'event', fn).stopListening(b);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenToOnce(b, 'event', fn).stopListening(b, 'event');
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
    a.listenToOnce(b, 'event', fn).stopListening(b, 'event', fn);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._events.event), 1);
    assert.equal(_.size(b._listeners), 0);
  });

  it('listenTo and off cleaning up references', function() {
    assert.expect(8);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    var fn = function() {};
    a.listenTo(b, 'event', fn);
    b.off();
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn);
    b.off('event');
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn);
    b.off(null, fn);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._listeners), 0);
    a.listenTo(b, 'event', fn);
    b.off(null, null, a);
    assert.equal(_.size(a._listeningTo), 0);
    assert.equal(_.size(b._listeners), 0);
  });

  it('listenTo and stopListening cleaning up references', function() {
    assert.expect(2);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenTo(b, 'all', function(){ assert.ok(true); });
    b.trigger('anything');
    a.listenTo(b, 'other', function(){ assert.ok(false); });
    a.stopListening(b, 'other');
    a.stopListening(b, 'all');
    assert.equal(_.size(a._listeningTo), 0);
  });

  it('listenToOnce without context cleans up references after the event has fired', function() {
    assert.expect(2);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenToOnce(b, 'all', function(){ assert.ok(true); });
    b.trigger('anything');
    assert.equal(_.size(a._listeningTo), 0);
  });

  it('listenToOnce with event maps cleans up references', function() {
    assert.expect(2);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenToOnce(b, {
      one: function() { assert.ok(true); },
      two: function() { assert.ok(false); }
    });
    b.trigger('one');
    assert.equal(_.size(a._listeningTo), 1);
  });

  it('listenToOnce with event maps binds the correct `this`', function() {
    assert.expect(1);
    var a = _.extend({}, Backbone.Events);
    var b = _.extend({}, Backbone.Events);
    a.listenToOnce(b, {
      one: function() { assert.ok(this === a); },
      two: function() { assert.ok(false); }
    });
    b.trigger('one');
  });

  it("listenTo with empty callback doesn't throw an error", function() {
    assert.expect(1);
    var e = _.extend({}, Backbone.Events);
    e.listenTo(e, 'foo', null);
    e.trigger('foo');
    assert.ok(true);
  });

  it('trigger all for each event', function() {
    assert.expect(3);
    var a, b, obj = {counter: 0};
    _.extend(obj, Backbone.Events);
    obj.on('all', function(event) {
      obj.counter++;
      if (event === 'a') a = true;
      if (event === 'b') b = true;
    })
    .trigger('a b');
    assert.ok(a);
    assert.ok(b);
    assert.equal(obj.counter, 2);
  });

  it('on, then unbind all functions', function() {
    assert.expect(1);
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);
    var callback = function() { obj.counter += 1; };
    obj.on('event', callback);
    obj.trigger('event');
    obj.off('event');
    obj.trigger('event');
    assert.equal(obj.counter, 1, 'counter should have only been incremented once.');
  });

  it('bind two callbacks, unbind only one', function() {
    assert.expect(2);
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, Backbone.Events);
    var callback = function() { obj.counterA += 1; };
    obj.on('event', callback);
    obj.on('event', function() { obj.counterB += 1; });
    obj.trigger('event');
    obj.off('event', callback);
    obj.trigger('event');
    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    assert.equal(obj.counterB, 2, 'counterB should have been incremented twice.');
  });

  it('unbind a callback in the midst of it firing', function() {
    assert.expect(1);
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);
    var callback = function() {
      obj.counter += 1;
      obj.off('event', callback);
    };
    obj.on('event', callback);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    assert.equal(obj.counter, 1, 'the callback should have been unbound.');
  });

  it('two binds that unbind themeselves', function() {
    assert.expect(2);
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, Backbone.Events);
    var incrA = function(){ obj.counterA += 1; obj.off('event', incrA); };
    var incrB = function(){ obj.counterB += 1; obj.off('event', incrB); };
    obj.on('event', incrA);
    obj.on('event', incrB);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
  });

  it('bind a callback with a supplied context', function() {
    assert.expect(1);
    var TestClass = function() {
      return this;
    };
    TestClass.prototype.assertTrue = function() {
      assert.ok(true, '`this` was bound to the callback');
    };

    var obj = _.extend({}, Backbone.Events);
    obj.on('event', function() { this.assertTrue(); }, new TestClass);
    obj.trigger('event');
  });

  it('nested trigger with unbind', function() {
    assert.expect(1);
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);
    var incr1 = function(){ obj.counter += 1; obj.off('event', incr1); obj.trigger('event'); };
    var incr2 = function(){ obj.counter += 1; };
    obj.on('event', incr1);
    obj.on('event', incr2);
    obj.trigger('event');
    assert.equal(obj.counter, 3, 'counter should have been incremented three times');
  });

  it('callback list is not altered during trigger', function() {
    assert.expect(2);
    var counter = 0, obj = _.extend({}, Backbone.Events);
    var incr = function(){ counter++; };
    var incrOn = function(){ obj.on('event all', incr); };
    var incrOff = function(){ obj.off('event all', incr); };

    obj.on('event all', incrOn).trigger('event');
    assert.equal(counter, 0, 'on does not alter callback list');

    obj.off().on('event', incrOff).on('event all', incr).trigger('event');
    assert.equal(counter, 2, 'off does not alter callback list');
  });

  it("#1282 - 'all' callback list is retrieved after each event.", function() {
    assert.expect(1);
    var counter = 0;
    var obj = _.extend({}, Backbone.Events);
    var incr = function(){ counter++; };
    obj.on('x', function() {
      obj.on('y', incr).on('all', incr);
    })
    .trigger('x y');
    assert.strictEqual(counter, 2);
  });

  it('if no callback is provided, `on` is a noop', function() {
    assert.expect(0);
    _.extend({}, Backbone.Events).on('test').trigger('test');
  });

  it('if callback is truthy but not a function, `on` should throw an error just like jQuery', function() {
    assert.expect(1);
    var view = _.extend({}, Backbone.Events).on('test', 'noop');
    try {
      view.trigger('test');
    } catch (e) {
      assert(true);
    }
  });

  it('remove all events for a specific context', function() {
    assert.expect(4);
    var obj = _.extend({}, Backbone.Events);
    obj.on('x y all', function() { assert.ok(true); });
    obj.on('x y all', function() { assert.ok(false); }, obj);
    obj.off(null, null, obj);
    obj.trigger('x y');
  });

  it('remove all events for a specific callback', function() {
    assert.expect(4);
    var obj = _.extend({}, Backbone.Events);
    var success = function() { assert.ok(true); };
    var fail = function() { assert.ok(false); };
    obj.on('x y all', success);
    obj.on('x y all', fail);
    obj.off(null, fail);
    obj.trigger('x y');
  });

  it('#1310 - off does not skip consecutive events', function() {
    assert.expect(0);
    var obj = _.extend({}, Backbone.Events);
    obj.on('event', function() { assert.ok(false); }, obj);
    obj.on('event', function() { assert.ok(false); }, obj);
    obj.off(null, null, obj);
    obj.trigger('event');
  });

  it('once', function() {
    assert.expect(2);
    // Same as the previous test, but we use once rather than having to explicitly unbind
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, Backbone.Events);
    var incrA = function(){ obj.counterA += 1; obj.trigger('event'); };
    var incrB = function(){ obj.counterB += 1; };
    obj.once('event', incrA);
    obj.once('event', incrB);
    obj.trigger('event');
    assert.equal(obj.counterA, 1, 'counterA should have only been incremented once.');
    assert.equal(obj.counterB, 1, 'counterB should have only been incremented once.');
  });

  it('once variant one', function() {
    assert.expect(3);
    var f = function(){ assert.ok(true); };

    var a = _.extend({}, Backbone.Events).once('event', f);
    var b = _.extend({}, Backbone.Events).on('event', f);

    a.trigger('event');

    b.trigger('event');
    b.trigger('event');
  });

  it('once variant two', function() {
    assert.expect(3);
    var f = function(){ assert.ok(true); };
    var obj = _.extend({}, Backbone.Events);

    obj
      .once('event', f)
      .on('event', f)
      .trigger('event')
      .trigger('event');
  });

  it('once with off', function() {
    assert.expect(0);
    var f = function(){ assert.ok(true); };
    var obj = _.extend({}, Backbone.Events);

    obj.once('event', f);
    obj.off('event', f);
    obj.trigger('event');
  });

  it('once with event maps', function() {
    var obj = {counter: 0};
    _.extend(obj, Backbone.Events);

    var increment = function() {
      this.counter += 1;
    };

    obj.once({
      a: increment,
      b: increment,
      c: increment
    }, obj);

    obj.trigger('a');
    assert.equal(obj.counter, 1);

    obj.trigger('a b');
    assert.equal(obj.counter, 2);

    obj.trigger('c');
    assert.equal(obj.counter, 3);

    obj.trigger('a b c');
    assert.equal(obj.counter, 3);
  });

  it('once with off only by context', function() {
    assert.expect(0);
    var context = {};
    var obj = _.extend({}, Backbone.Events);
    obj.once('event', function(){ assert.ok(false); }, context);
    obj.off(null, null, context);
    obj.trigger('event');
  });

  it('once with asynchronous events', function(done) {
    assert.expect(1);
    var func = _.debounce(function() { assert.ok(true); done(); }, 50);
    var obj = _.extend({}, Backbone.Events).once('async', func);

    obj.trigger('async');
    obj.trigger('async');
  });

  it('once with multiple events.', function() {
    assert.expect(2);
    var obj = _.extend({}, Backbone.Events);
    obj.once('x y', function() { assert.ok(true); });
    obj.trigger('x y');
  });

  it('Off during iteration with once.', function() {
    assert.expect(2);
    var obj = _.extend({}, Backbone.Events);
    var f = function(){ this.off('event', f); };
    obj.on('event', f);
    obj.once('event', function(){});
    obj.on('event', function(){ assert.ok(true); });

    obj.trigger('event');
    obj.trigger('event');
  });

  it('once without a callback is a noop', function() {
    assert.expect(0);
    _.extend({}, Backbone.Events).once('event').trigger('event');
  });

  it('listenToOnce without a callback is a noop', function() {
    assert.expect(0);
    var obj = _.extend({}, Backbone.Events);
    obj.listenToOnce(obj, 'event').trigger('event');
  });

  it('event functions are chainable', function() {
    var obj = _.extend({}, Backbone.Events);
    var obj2 = _.extend({}, Backbone.Events);
    var fn = function() {};
    assert.equal(obj, obj.trigger('noeventssetyet'));
    assert.equal(obj, obj.off('noeventssetyet'));
    assert.equal(obj, obj.stopListening('noeventssetyet'));
    assert.equal(obj, obj.on('a', fn));
    assert.equal(obj, obj.once('c', fn));
    assert.equal(obj, obj.trigger('a'));
    assert.equal(obj, obj.listenTo(obj2, 'a', fn));
    assert.equal(obj, obj.listenToOnce(obj2, 'b', fn));
    assert.equal(obj, obj.off('a c'));
    assert.equal(obj, obj.stopListening(obj2, 'a'));
    assert.equal(obj, obj.stopListening());
  });

  it('#3448 - listenToOnce with space-separated events', function() {
    assert.expect(2);
    var one = _.extend({}, Backbone.Events);
    var two = _.extend({}, Backbone.Events);
    var count = 1;
    one.listenToOnce(two, 'x y', function(n) { assert.ok(n === count++); });
    two.trigger('x', 1);
    two.trigger('x', 1);
    two.trigger('y', 2);
    two.trigger('y', 2);
  });

});
