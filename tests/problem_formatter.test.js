const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('docs/problem.html', 'utf8');
const signature = 'function formatTeX(text) {';
const start = html.indexOf(signature);
const end = html.indexOf('        function initGiscus', start);

assert.notEqual(start, -1, 'formatTeX must exist in docs/problem.html');
assert.notEqual(end, -1, 'formatTeX must end before initGiscus');

const context = {};
vm.runInNewContext(`${html.slice(start, end)}; this.formatTeX = formatTeX;`, context);

const model = context.formatTeX(String.raw`GPT Pro 5.6 (\emph{gpt-5-6-pro}).`);
assert.equal(model, '<p>GPT Pro 5.6 (<em>gpt-5-6-pro</em>).</p>');

const source = context.formatTeX(String.raw`Source: (\url{https://example.com/a}).`);
assert.equal(source, '<p>Source: (<a href="https://example.com/a" target="_blank">https://example.com/a</a>).</p>');
assert.equal((source.match(/<a\b/g) || []).length, 1);

const math = context.formatTeX(String.raw`For \(x^2+1\), continue.`);
assert.match(math, /\$x\^2\+1\$/);

const comparison = context.formatTeX(String.raw`\[
x
>0
\]`);
assert.match(comparison, /&gt;0/);
assert.doesNotMatch(comparison, /blockquote/);

console.log('problem formatter regression checks passed');
