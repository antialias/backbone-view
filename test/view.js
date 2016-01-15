var assert = require('assert-expect');
var _ = require('underscore');
var Backbone = require('../backbone');
var CustomEvent = require('custom-event');

describe('Backbone.View', function() {
  var view;
  var newClickEvent;
  beforeEach(function() {
    newClickEvent = function() {
      var event = document.createEvent('Event');
      event.initEvent('click', true, true);
      return event;
    };
    document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
    view = new Backbone.View({
      id: 'test-view',
      className: 'test-view',
      other: 'non-special-option'
    });
  });

  afterEach(function() {
    assert.finished();
  });

  it('constructor', function() {
    assert.expect(3);
    assert.equal(view.el.id, 'test-view');
    assert.equal(view.el.className, 'test-view');
    assert.equal(view.el.other, void 0);
  });

  it('$', function() {
    assert.expect(2);
    var myView = new Backbone.View({
      tagName: 'p'
    });
    myView.el.innerHTML = '<a><b>test</b></a>';
    var result = myView.$('a b');

    assert.strictEqual(result[0].innerHTML, 'test');
    assert.ok(result.length === +result.length);
  });

  it('initialize', function() {
    assert.expect(1);
    var View = Backbone.View.extend({
      initialize: function() {
        this.one = 1;
      }
    });

    assert.strictEqual(new View().one, 1);
  });

  it('render', function() {
    assert.expect(1);
    var myView = new Backbone.View;
    assert.equal(myView.render(), myView, '#render returns the view instance');
  });

  it('delegateEvents', function() {
    assert.expect(6);
    var counter1 = 0, counter2 = 0;

    var myView = new Backbone.View({el: '#testElement'});
    myView.increment = function(){ counter1++; };
    myView.el.addEventListener('click', function(){ counter2++; });

    var events = {'click h1': 'increment'};

    myView.delegateEvents(events);
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 1);
    assert.equal(counter2, 1);

    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 2);
    assert.equal(counter2, 2);

    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 3);
    assert.equal(counter2, 3);
  });

  it('delegate', function() {
    assert.expect(3);
    var myView = new Backbone.View({el: '#testElement'});
    myView.delegate('click', 'h1', function() {
      assert.ok(true);
    });
    myView.delegate('click', function() {
      assert.ok(true);
    });
    myView.$('h1')[0].dispatchEvent(newClickEvent());

    assert.equal(myView.delegate(), myView, '#delegate returns the view instance');
  });

  it('delegateEvents allows functions for callbacks', function() {
    assert.expect(3);
    var myView = new Backbone.View({tagName: 'p'});
    myView.counter = 0;

    var events = {
      click: function() {
        this.counter++;
      }
    };

    myView.delegateEvents(events);
    myView.el.dispatchEvent(newClickEvent());
    assert.equal(myView.counter, 1);

    myView.el.dispatchEvent(newClickEvent());
    assert.equal(myView.counter, 2);

    myView.delegateEvents(events);
    myView.el.dispatchEvent(newClickEvent());
    assert.equal(myView.counter, 3);
  });


  it('delegateEvents ignore undefined methods', function() {
    assert.expect(0);
    var myView = new Backbone.View({tagName: 'p'});
    myView.delegateEvents({'click': 'undefinedMethod'});
    myView.el.dispatchEvent(newClickEvent());
  });

  it('undelegateEvents', function() {
    assert.expect(7);
    var counter1 = 0, counter2 = 0;

    var myView = new Backbone.View({el: '#testElement'});
    myView.increment = function(){ counter1++; };
    myView.el.addEventListener('click', function(){ counter2++; });

    var events = {'click h1': 'increment'};

    myView.delegateEvents(events);
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 1);
    assert.equal(counter2, 1);

    myView.undelegateEvents();
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 1);
    assert.equal(counter2, 2);

    myView.delegateEvents(events);
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter1, 2);
    assert.equal(counter2, 3);

    assert.equal(myView.undelegateEvents(), myView, '#undelegateEvents returns the view instance');
  });

  it('undelegate', function() {
    assert.expect(1);
    var myView = new Backbone.View({el: '#testElement'});
    myView.delegate('click', function() { assert.ok(false); });
    myView.delegate('click', 'h1', function() { assert.ok(false); });

    myView.undelegate('click');

    myView.$('h1')[0].dispatchEvent(newClickEvent());
    myView.el.dispatchEvent(newClickEvent());

    assert.equal(myView.undelegate(), myView, '#undelegate returns the view instance');
  });

  it('undelegate with passed handler', function() {
    assert.expect(1);
    var myView = new Backbone.View({el: '#testElement'});
    var listener = function() { assert.ok(false); };
    myView.delegate('click', listener);
    myView.delegate('click', function() { assert.ok(true); });
    myView.undelegate('click', listener);
    myView.el.dispatchEvent(newClickEvent());
  });

  it('undelegate with selector', function() {
    assert.expect(2);
    var myView = new Backbone.View({el: '#testElement'});
    myView.delegate('click', function() { assert.ok(true); });
    myView.delegate('click', 'h1', function() { assert.ok(false); });
    myView.undelegate('click', 'h1');
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    myView.el.dispatchEvent(newClickEvent());
  });

  it('undelegate with handler and selector', function() {
    assert.expect(2);
    var myView = new Backbone.View({el: '#testElement'});
    myView.delegate('click', function() { assert.ok(true); });
    var handler = function(){ assert.ok(false); };
    myView.delegate('click', 'h1', handler);
    myView.undelegate('click', 'h1', handler);
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    myView.el.dispatchEvent(newClickEvent());
  });

  it('tagName can be provided as a string', function() {
    assert.expect(1);
    var View = Backbone.View.extend({
      tagName: 'span'
    });

    assert.equal(new View().el.tagName, 'SPAN');
  });

  it('tagName can be provided as a function', function() {
    assert.expect(1);
    var View = Backbone.View.extend({
      tagName: function() {
        return 'p';
      }
    });

    assert.ok(new View().el.matches('p'));
  });

  it('_ensureElement with DOM node el', function() {
    assert.expect(1);
    var View = Backbone.View.extend({
      el: document.body
    });

    assert.equal(new View().el, document.body);
  });

  it('_ensureElement with string el', function() {
    assert.expect(4);
    var View = Backbone.View.extend({
      el: 'body'
    });
    assert.strictEqual(new View().el, document.body);

    var selector = '#testElement > h1';
    var testH1 = document.querySelector(selector);
    assert(testH1);
    View = Backbone.View.extend({
      el: selector
    });
    assert.strictEqual(new View().el, testH1);

    View = Backbone.View.extend({
      el: '#nonexistent'
    });
    assert.ok(!new View().el);
  });

  it('with className and id functions', function() {
    assert.expect(2);
    var View = Backbone.View.extend({
      className: function() {
        return 'className';
      },
      id: function() {
        return 'id';
      }
    });

    assert.strictEqual(new View().el.className, 'className');
    assert.strictEqual(new View().el.id, 'id');
  });

  it('with attributes', function() {
    assert.expect(2);
    var View = Backbone.View.extend({
      attributes: {
        'id': 'id',
        'class': 'class'
      }
    });

    assert.strictEqual(new View().el.className, 'class');
    assert.strictEqual(new View().el.id, 'id');
  });

  it('with attributes as a function', function() {
    assert.expect(1);
    var View = Backbone.View.extend({
      attributes: function() {
        return {'class': 'dynamic'};
      }
    });

    assert.strictEqual(new View().el.className, 'dynamic');
  });

  it('should default to className/id properties', function() {
    assert.expect(4);
    var View = Backbone.View.extend({
      className: 'backboneClass',
      id: 'backboneId',
      attributes: {
        'class': 'attributeClass',
        'id': 'attributeId'
      }
    });

    var myView = new View;
    assert.strictEqual(myView.el.className, 'backboneClass');
    assert.strictEqual(myView.el.id, 'backboneId');
    assert.strictEqual(myView.el.getAttribute('class'), 'backboneClass');
    assert.strictEqual(myView.el.getAttribute('id'), 'backboneId');
  });

  it('multiple views per element', function() {
    assert.expect(3);
    var count = 0;
    var el = document.createElement('p');

    var View = Backbone.View.extend({
      el: el,
      events: {
        click: function() {
          count++;
        }
      }
    });

    var view1 = new View;
    el.dispatchEvent(newClickEvent());
    assert.equal(1, count);

    var view2 = new View;
    el.dispatchEvent(newClickEvent());
    assert.equal(3, count);

    view1.delegateEvents();
    el.dispatchEvent(newClickEvent());
    assert.equal(5, count);
  });

  it('custom events', function() {
    assert.expect(2);
    var View = Backbone.View.extend({
      el: document.body,
      events: {
        fake$event: function() { assert.ok(true); }
      }
    });

    var myView = new View;

    document.body.dispatchEvent(new CustomEvent('fake$event'));
    document.body.dispatchEvent(new CustomEvent('fake$event'));
    myView.undelegate('fake$event');
    document.body.dispatchEvent(new CustomEvent('fake$event'));
  });


  it('#986 - Undelegate before changing element.', function() {
    assert.expect(1);
    var button1 = document.createElement('button');
    var button2 = document.createElement('button');

    var View = Backbone.View.extend({
      events: {
        click: function(e) {
          assert.ok(myView.el === e.target);
        }
      }
    });

    var myView = new View({el: button1});
    myView.setElement(button2);

    button1.dispatchEvent(newClickEvent());
    button2.dispatchEvent(newClickEvent());
  });

  it('#1172 - Clone attributes object', function() {
    assert.expect(2);
    var View = Backbone.View.extend({
      attributes: {foo: 'bar'}
    });

    var view1 = new View({id: 'foo'});
    assert.strictEqual(view1.el.id, 'foo');

    var view2 = new View();
    assert.ok(!view2.el.id);
  });

  it('views stopListening', function() {
    assert.expect(0);
    var TestEmitter = function() {};
    _.extend(TestEmitter.prototype, Backbone.Events);
    var View = Backbone.View.extend({
      initialize: function() {
        this.listenTo(this.model, 'all x', function(){ assert.ok(false); });
        this.listenTo(this.collection, 'all x', function(){ assert.ok(false); });
      }
    });
    var myView = new View({
      model: new TestEmitter,
      collection: new TestEmitter
    });

    myView.stopListening();
    myView.model.trigger('x');
    myView.collection.trigger('x');
  });

  it('Provide function for el.', function() {
    assert.expect(2);
    var View = Backbone.View.extend({
      el: function() {
        var el = document.createElement('p');
        el.innerHTML = '<a></a>';
        return el;
      }
    });

    var myView = new View;
    assert.equal(myView.el.tagName, 'P');
    assert.equal(myView.el.childNodes[0].tagName, 'A');
  });

  it('events passed in options', function() {
    assert.expect(1);
    var counter = 0;

    var View = Backbone.View.extend({
      el: '#testElement',
      increment: function() {
        counter++;
      }
    });

    var myView = new View({
      events: {
        'click h1': 'increment'
      }
    });

    myView.$('h1')[0].dispatchEvent(newClickEvent());
    myView.$('h1')[0].dispatchEvent(newClickEvent());
    assert.equal(counter, 2);
  });

  it('remove', function() {
    assert.expect(1);
    var myView = new Backbone.View;
    document.body.appendChild(myView.el);

    myView.delegate('click', function() { assert.ok(false); });
    myView.listenTo(myView, 'all x', function() { assert.ok(false); });

    assert.equal(myView.remove(), myView, '#remove returns the view instance');
    myView.el.dispatchEvent(newClickEvent());
    myView.trigger('x');
  });

  it('setElement', function() {
    assert.expect(2);
    var myView = new Backbone.View({
      events: {
        click: function() { assert.ok(false); }
      }
    });
    myView.events = {
      click: function() { assert.ok(true); }
    };
    var oldEl = myView.el;

    myView.setElement(document.createElement('div'));

    oldEl.dispatchEvent(newClickEvent());
    myView.el.dispatchEvent(newClickEvent());

    assert.notEqual(oldEl, myView.el);
  });

});
