const fs = require('fs');
const path = require('path');

// Function to fix innerHTML warnings by replacing with textContent
function fixInnerHTML(filePath) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace innerHTML with textContent for i18n messages
  // This is safe because we're only setting text content, not HTML
  content = content.replace(/\.innerHTML\s*=\s*chrome\.i18n\.getMessage\(/g, '.textContent = chrome.i18n.getMessage(');

  fs.writeFileSync(filePath, content);
  console.log(`Fixed innerHTML in ${path.basename(filePath)}`);
}

// Fix all JS files
const files = ['popup.js', 'options.js'];
const srcDir = path.join(__dirname, '..');

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  fixInnerHTML(filePath);

  // Also fix in dist folders
  const chromePath = path.join(srcDir, 'dist', 'chrome', file);
  const firefoxPath = path.join(srcDir, 'dist', 'firefox', file);

  fixInnerHTML(chromePath);
  fixInnerHTML(firefoxPath);
});

console.log('\n✅ Fixed all innerHTML warnings');