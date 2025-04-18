#!/usr/bin/env node
/**
 * Script to auto-add missing translation keys to messages/en.json
 */
const fs = require('fs');
const path = require('path');

const locale = process.argv[2] || 'en';
const messagesPath = path.resolve(__dirname, `../messages/${locale}.json`);
if (!fs.existsSync(messagesPath)) {
  console.error(`${locale}.json not found:`, messagesPath);
  process.exit(1);
}
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

function collectFiles(dir, ext) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}
const srcDir = path.resolve(__dirname, '../src');
const files = collectFiles(srcDir, '.tsx');

function getValue(obj, pathArr) {
  return pathArr.reduce((o, key) => (o && key in o ? o[key] : undefined), obj);
}
const regex = /t\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
const missing = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content))) {
    const fullKey = match[1];
    const parts = fullKey.split('.');
    if (getValue(messages, parts) === undefined) {
      missing.add(fullKey);
    }
  }
});

if (missing.size === 0) {
  console.log('✅ No missing translation keys');
  process.exit(0);
}

for (const fullKey of missing) {
  const parts = fullKey.split('.');
  let obj = messages;
  parts.forEach((p, i) => {
    if (i === parts.length - 1) {
      if (!(p in obj)) obj[p] = fullKey;
    } else {
      if (!(p in obj) || typeof obj[p] !== 'object') obj[p] = {};
      obj = obj[p];
    }
  });
}

fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2) + '\n');
console.log(`✅ Added ${missing.size} stubs to ${locale}.json`);
