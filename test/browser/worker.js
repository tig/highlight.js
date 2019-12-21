'use strict';

const Worker   = require('tiny-worker');

describe('web worker', function() {
  before(async function() {

    this.worker = new Worker(function() {
      self.onmessage = function(event) {
        if (event.data.action === 'importScript') {
          importScripts(event.data.script);
          postMessage(1);
        } else {
          var result = self.hljs.highlight('javascript', event.data);
          postMessage(result.value);
        }
      };
    });

    const done = new Promise(resolve => this.worker.onmessage = resolve);
    this.worker.postMessage({
      action: 'importScript',
      script: this.hljsPath
    });
    return done;
  });

  it('should highlight text', function(done) {
    this.worker.onmessage = event => {
      const actual = event.data;

      actual.should.equal(this.expect);

      done();
    };

    this.worker.postMessage(this.text);
  });

  after(function() {
    this.worker.terminate();
  });
});
