#!/usr/bin/env node
/**
 * Script to check for missing translation keys in messages/en.json
 * Scans all .tsx files under src for t("key") calls and compares against en.json
 */
const fs = require('fs');
const path = require('path');

// Load translations
const messagesPath = path.resolve(__dirname, '../messages/en.json');
if (!fs.existsSync(messagesPath)) {
  console.error('en.json not found at', messagesPath);
  process.exit(1);
}
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

// Collect .tsx files
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
if (!fs.existsSync(srcDir)) {
  console.error('src directory not found at', srcDir);
  process.exit(1);
}
const files = collectFiles(srcDir, '.tsx');

// Helper to get nested value
function getValue(obj, pathArr) {
  return pathArr.reduce((o, key) => (o && key in o ? o[key] : undefined), obj);
}

// Regex to match t("key") or t('key')
const regex = /t\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
const missing = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content))) {
    const key = match[1];
    const parts = key.split('.');
    if (getValue(messages, parts) === undefined) {
      missing.add(`${file}: ${key}`);
    }
  }
});

if (missing.size === 0) {
  console.log('✅ All translation keys found in en.json');
} else {
  console.error('❌ Missing translation keys:');
  for (const item of missing) console.error(item);
  process.exit(1);
}
