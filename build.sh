#!/bin/bash

# Define release directory
RELEASE_DIR="release"
EXTENSION_NAME="mastodonify"

# Create release directory if it doesn't exist
mkdir -p "$RELEASE_DIR"

# Clean up previous builds
rm -f "$RELEASE_DIR/${EXTENSION_NAME}-chrome.zip"
rm -f "$RELEASE_DIR/${EXTENSION_NAME}-firefox.zip"

# Function to build for a specific target
build_target() {
    TARGET=$1
    echo "Building for $TARGET..."
    
    # Create temp dir for this target
    BUILD_DIR="build_tmp_$TARGET"
    rm -rf "$BUILD_DIR"
    mkdir "$BUILD_DIR"
    
    # Copy files
    cp -r icons "$BUILD_DIR/"
    cp -r _locales "$BUILD_DIR/"
    cp background.js "$BUILD_DIR/"
    cp options.html "$BUILD_DIR/"
    cp options.js "$BUILD_DIR/"
    cp popup.html "$BUILD_DIR/"
    cp popup.js "$BUILD_DIR/"
    
    # Handle Manifest
    cp manifest.json "$BUILD_DIR/"
    
    if [ "$TARGET" == "firefox" ]; then
        # Modify manifest for Firefox: Swap service_worker for scripts AND add Gecko ID
        echo "Patching manifest for Firefox..."
        python3 -c "import json; 
with open('$BUILD_DIR/manifest.json', 'r') as f: data = json.load(f); 
data['background'] = {'scripts': ['background.js']}; 
# Firefox requires an ID for some MV3 features to behave consistently
if 'browser_specific_settings' not in data:
    data['browser_specific_settings'] = {};
if 'gecko' not in data['browser_specific_settings']:
    data['browser_specific_settings']['gecko'] = {};
data['browser_specific_settings']['gecko']['id'] = 'mastodonify@eallion.com';
data['browser_specific_settings']['gecko']['strict_min_version'] = '109.0';
with open('$BUILD_DIR/manifest.json', 'w') as f: json.dump(data, f, indent=2)"
    fi

    # Zip it
    cd "$BUILD_DIR"
    zip -r "../$RELEASE_DIR/${EXTENSION_NAME}-${TARGET}.zip" . -x "*.DS_Store"
    cd ..
    
    # Cleanup
    rm -rf "$BUILD_DIR"
}

build_target "chrome"
build_target "firefox"

echo "Build complete! Check the '$RELEASE_DIR' directory."
ls -lh "$RELEASE_DIR"
