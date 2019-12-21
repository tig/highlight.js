'use strict';

const { JSDOM } = require('jsdom');
const {promisify} = require('util');
const fs       = require('fs');

const buildFakeDOM = async function() {
  const library = fs.readFileSync(this.hljsPath, 'utf8');
  const hljsScript = `<script>${library}</script>`;
  const { window} = await new JSDOM(hljsScript + this.html, { runScripts: "dangerously" });

  this.block = window.document.querySelector('pre code');
  this.hljs  = window.hljs;
};

describe('browser with html with quotes in attributes', function() {
  it('should property escape all quotes', async function() {
    this.text = "const oops = pick(employee, <span data-title=\" Type '&quot;height&quot;' is not assignable to type '&quot;name&quot; | &quot;age'&quot; | &quot;profession&quot;'.\">['name', 'height']</span>)\n"
    this.html = `<pre><code class="javascript">${this.text}</code></pre>`;

    // can't use before because we need to do setup first
    await buildFakeDOM.bind(this)();

    this.hljs.highlightBlock(this.block);
    const actual = this.block.innerHTML;
    actual.should.equal(
      `<span class="hljs-keyword">const</span> oops = pick(employee, <span data-title=" Type '&quot;height&quot;' is not assignable to type '&quot;name&quot; | &quot;age'&quot; | &quot;profession&quot;'.">[<span class="hljs-string">'name'</span>, <span class="hljs-string">'height'</span>]</span>)\n`);
  });
})

describe('plain browser', function() {
  before(async function() { await buildFakeDOM.bind(this)(); });

  it('should return relevance key', function() {
    var out = this.hljs.highlight("javascript","");
    out.relevance.should.equal(0);
  })

  it('should highlight block', function() {
    this.hljs.highlightBlock(this.block);

    const actual = this.block.innerHTML;

    actual.should.equal(this.expect);
  });
});
