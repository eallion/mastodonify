// Browser API polyfill for Firefox compatibility
// This file provides compatibility between Chrome and Firefox extension APIs

// Use browser API if available, otherwise fall back to Chrome API
if (typeof browser === 'undefined') {
    var browser = chrome || browser;
}

// For Firefox, ensure we use the browser namespace
if (typeof chrome !== 'undefined' && typeof browser !== 'undefined') {
    // Keep using browser API for Firefox
    window.chrome = browser;
}

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = browser;
}