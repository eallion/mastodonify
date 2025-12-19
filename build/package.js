const fs = require('fs');
const path = require('path');
const zipAFolder = require('zip-a-folder');

const distDir = path.join(__dirname, '..', 'dist');
const releaseDir = path.join(__dirname, '..', 'release');

// Create release directory if it doesn't exist
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

async function packageExtensions() {
  try {
    // Get version
    const version = getVersion();

    // Create version-specific directory
    const versionDir = path.join(releaseDir, version);
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }

    // Package Chrome extension
    const chromeDir = path.join(distDir, 'chrome');
    if (fs.existsSync(chromeDir)) {
      const chromeZip = path.join(versionDir, `mastodonify-chrome-v${version}.zip`);
      await zipAFolder.zip(chromeDir, chromeZip);
      console.log(`✅ Chrome extension packaged: ${chromeZip}`);
    }

    // Package Firefox extension
    const firefoxDir = path.join(distDir, 'firefox');
    if (fs.existsSync(firefoxDir)) {
      const firefoxZip = path.join(versionDir, `mastodonify-firefox-v${version}.zip`);
      await zipAFolder.zip(firefoxDir, firefoxZip);
      console.log(`✅ Firefox extension packaged: ${firefoxZip}`);
    }

    console.log(`\n🎉 All extensions packaged successfully in ${versionDir}!`);
  } catch (error) {
    console.error('❌ Error packaging extensions:', error);
    process.exit(1);
  }
}

function getVersion() {
  const manifestPath = path.join(__dirname, '..', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.version;
}

packageExtensions();