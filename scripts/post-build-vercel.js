
const fs = require('fs');
const path = require('path');

console.log('🔄 Running VeCollab post-build script for Vercel...');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(DIST_DIR, 'public');
const API_DIR = path.join(DIST_DIR, 'api');

if (!fs.existsSync(API_DIR)) {
  console.log('Creating API directory...');
  fs.mkdirSync(API_DIR, { recursive: true });
}

const apiIndexFile = path.join(API_DIR, 'index.js');
if (!fs.existsSync(apiIndexFile)) {
  console.log('Creating API routes file...');
  fs.writeFileSync(apiIndexFile, `
const express = require('express');
const app = express();
app.use(express.json());

module.exports = (req, res) => {
  return app(req, res);
};`);
}

console.log('✅ VeCollab post-build preparation complete!');
