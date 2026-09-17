const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { cleanHtmlToMarkdown } = require('../main.js');

console.log('🧪 Starting E2E Smoke Test for Clean Clipper Obsidian Plugin...');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'manifest.json');
const mainPath = path.join(rootDir, 'main.js');

// 1. Verify manifest.json
assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

assert.strictEqual(manifest.id, 'obsidian-clean-clipper');
assert.strictEqual(manifest.name, 'Clean Clipper Pro');
assert.ok(manifest.fundingUrl, 'fundingUrl must be present for community donation button');
assert.ok(manifest.fundingUrl.includes('buymeacoffee.com'), 'Funding must point to BMC');
console.log('✅ manifest.json verified with official funding integration.');

// 2. Logic & Purification assertions
const sampleHtml = `
<nav>Skip to content</nav>
<h1>The Future of AI Architecture</h1>
<p>Here is an explanation with <strong>bold</strong> and <em>italic</em>.</p>
<blockquote>A truly clean note is a quiet mind.</blockquote>
<pre><code>function test() { return 1; }</code></pre>
<script>alert("tracker");</script>
<footer>Copyright 2026</footer>
`;

const md = cleanHtmlToMarkdown(sampleHtml);
assert.ok(!md.includes('Skip to content'), 'Nav must be stripped');
assert.ok(!md.includes('tracker'), 'Script must be stripped');
assert.ok(!md.includes('Copyright 2026'), 'Footer must be stripped');
assert.ok(md.includes('# The Future of AI Architecture'), 'H1 heading must match');
assert.ok(md.includes('**bold**'), 'Bold must match');
assert.ok(md.includes('*italic*'), 'Italic must match');
assert.ok(md.includes('> A truly clean note is a quiet mind.'), 'Blockquote must match');
assert.ok(md.includes('```\nfunction test() { return 1; }\n```'), 'Code block must match');
console.log('✅ HTML to clean Markdown purification logic 100% verified.');

console.log('🎉 Clean Clipper Obsidian Plugin smoke test passed with exit code 0.');
process.exit(0);
