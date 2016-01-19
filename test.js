var jsdom = require('jsdom').jsdom;
var document = global.document = jsdom(undefined, {});
var window = global.window = document.defaultView;
global.Element = window.Element;

var Mocha = require('mocha');
var mocha = new Mocha({
  reporter:"spec"
});
mocha.addFile("test/view.js");
mocha.addFile("test/events.js");
mocha.run(function(failures){
  process.exit(failures);
});
