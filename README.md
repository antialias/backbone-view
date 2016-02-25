# simple-view
Fork of Backbone.View (and Backbone.Events):
* simplified to support only commonjs.
* browser support requires a commonjs bundler (e.g. webpack or browserify)
* jQuery dependency has been removed
 * no support for `view.$el`
 * `view.$` uses `view.el.querySelectorAll`
* Specs have been ported from QUnit + phantomjs to mocha + jsdom.
 * specs are no longer run on an actual browser, use at your own risk.

##installation:
```sh
npm install --save simple-view
```

##usage:
```js
const View = require('simple-view').View;
```

##documentation
See [`Backbone.View`](http://backbonejs.org/#View).
