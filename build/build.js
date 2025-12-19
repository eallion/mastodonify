const fs = require('fs');
const path = require('path');
const { firefoxifyDir } = require('./firefoxify');

const browser = process.argv[2]; // chrome or firefox

if (!browser || !['chrome', 'firefox'].includes(browser)) {
  console.error('Please specify browser: chrome or firefox');
  process.exit(1);
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist', browser);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all necessary files
const filesToCopy = [
  'background.js',
  'popup.html',
  'popup.js',
  'options.js',
  'styles.css',
  'generate_badged_icons.js',
  '_locales',
  'icons',
  'assets'
];

// Add browser polyfill for Firefox
if (browser === 'firefox') {
  // Copy polyfill directly to the root of dist folder
  const polyfillSrc = path.join(__dirname, 'browser-polyfill.js');
  const polyfillDest = path.join(distDir, 'browser-polyfill.js');
  fs.copyFileSync(polyfillSrc, polyfillDest);
  console.log('Copied browser-polyfill.js');
}

filesToCopy.forEach(file => {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(distDir, file);

  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`Copied ${file} to ${browser} build`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy the appropriate manifest
const manifestSrc = path.join(__dirname, '..', 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');

if (browser === 'firefox') {
  // Read and modify manifest for Firefox
  const manifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf8'));

  // Firefox specific modifications
  const firefoxManifest = {
    ...manifest,
    manifest_version: 3, // Firefox supports Manifest V3 with some differences
    browser_specific_settings: {
      gecko: {
        id: "mastodonify@eallion.com",
        strict_min_version: "140.0", // Support for data_collection_permissions
        data_collection_permissions: {
          "is_usage_data": false,
          "includes_personal_data": false,
          "includes_identified_data": false,
          "includes_sensitive_data": false,
          "required": ["none"]
        },
        data_collection: {
          "is_usage_data": false,
          "includes_personal_data": false,
          "includes_identified_data": false,
          "includes_sensitive_data": false,
          "data_usage": {
            "purpose": "To display Mastodon notification counts",
            "description": "The extension only fetches notification counts from Mastodon instances to display them on the browser badge. No personal data is collected or stored."
          }
        }
      }
    },
    permissions: [
      "storage",
      "notifications",
      "activeTab",
      "tabs"
    ],
    // Add host_permissions for Firefox
    host_permissions: ["https://*/*"],
    // Firefox V3 still uses background.scripts instead of service_worker
    background: {
      scripts: ["browser-polyfill.js", "background.js"],
      type: "module"
    },
    // Ensure action has all icon sizes for Firefox
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/mastodonify-16.png",
        "32": "icons/mastodonify-32.png",
        "48": "icons/mastodonify-48.png",
        "64": "icons/mastodonify-64.png",
        "128": "icons/mastodonify-128.png"
      },
      // Firefox may need theme_icons for toolbar display
      theme_icons: [
        {
          "size": 16,
          "light": "icons/mastodonify-16.png",
          "dark": "icons/mastodonify-16.png"
        },
        {
          "size": 32,
          "light": "icons/mastodonify-32.png",
          "dark": "icons/mastodonify-32.png"
        }
      ]
    }
  };

  // Remove Chrome-specific properties
  delete firefoxManifest.content_security_policy;
  delete firefoxManifest.background.service_worker;

  fs.writeFileSync(manifestDest, JSON.stringify(firefoxManifest, null, 2));
  console.log('Created Firefox manifest');
} else {
  // Copy Chrome manifest as-is
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('Copied Chrome manifest');
}

// Firefox-ify the build if it's Firefox
if (browser === 'firefox') {
  console.log('\n🔥 Applying Firefox compatibility...');
  firefoxifyDir(distDir);
}

console.log(`\n✅ Build completed for ${browser}`);
console.log(`Output: ${distDir}`);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}