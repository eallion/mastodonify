const fs = require('fs');
const path = require('path');

// Function to Firefox-ify a JavaScript file
function firefoxifyFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add polyfill import at the beginning of JS files
  if (filePath.endsWith('.js') && !filePath.includes('browser-polyfill.js')) {
    // Check if already firefoxified
    if (!content.includes('// Firefox compatibility polyfill')) {
      const polyfill = `// Firefox compatibility polyfill
// Import browser API polyfill for Firefox
try {
  importScripts('browser-polyfill.js');
} catch (e) {
  // Fallback if importScripts fails
}

// Use browser API with fallback to chrome
const chromeAPI = typeof browser !== 'undefined' ? browser : chrome;

// Firefox doesn't support badgeTextColor
if (!chromeAPI.action.setBadgeTextColor) {
  chromeAPI.action.setBadgeTextColor = function() {};
}

// Firefox doesn't support setBadgeProperties
if (!chromeAPI.action.setBadgeProperties) {
  chromeAPI.action.setBadgeProperties = function() {};
}

// Replace chrome with chromeAPI in the global scope
if (typeof chrome !== 'undefined') {
  chrome = chromeAPI;
}

`;
      content = polyfill + content;

      // Replace all chrome.* with chromeAPI.* for Firefox compatibility
      content = content.replace(/\bchrome\./g, 'chromeAPI.');

      fs.writeFileSync(filePath, content);
      console.log(`Firefox-ified: ${path.basename(filePath)}`);
    }
  }
}

// Function to Firefox-ify HTML files
function firefoxifyHtml(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add polyfill script before other scripts for Firefox
  if (filePath.endsWith('.html') && !content.includes('browser-polyfill.js')) {
    content = content.replace(
      '<script src="popup.js"></script>',
      '<script src="browser-polyfill.js"></script>\n    <script src="popup.js"></script>'
    );
    fs.writeFileSync(filePath, content);
    console.log(`Firefox-ified HTML: ${path.basename(filePath)}`);
  }
}

// Firefox-ify all files in a directory
function firefoxifyDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      firefoxifyDir(filePath);
    } else {
      firefoxifyFile(filePath);
      firefoxifyHtml(filePath);
    }
  });
}

module.exports = { firefoxifyDir, firefoxifyFile, firefoxifyHtml };