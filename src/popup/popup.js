import StorageManager from '../utils/storage.js';

/**
 * Updates the display of the current URL
 */
async function updateCurrentUrl() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const urlElement = document.getElementById('currentUrl');

    if (currentTab?.url) {
        urlElement.textContent = `Current URL: ${currentTab.url}`;

        // Pre-fill URL pattern based on current URL
        const urlPattern = document.getElementById('urlPattern');
        const url = new URL(currentTab.url);
        urlPattern.value = `*://${url.hostname}/*`;

        // Check if a rule already exists for this URL
        const rule = await StorageManager.findMatchingRule(currentTab.url);
        if (rule) {
            document.getElementById('themeColor').value = rule.color;
            document.getElementById('submitButton').textContent = 'Update Rule';
        }
    } else {
        urlElement.textContent = 'No active tab';
    }
}

/**
 * Applies theme to the current tab
 * @param {string} color - Hexadecimal color code
 */
async function applyThemeToCurrentTab(color) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        const textColor = getContrastColor(color);
        await browser.theme.update({
            colors: {
                frame: color,
                tab_background_text: textColor,
                tab_selected: color,
                toolbar: color,
                toolbar_text: textColor,
                toolbar_field: adjustBrightness(color, 10),
                toolbar_field_text: textColor
            }
        });
    }
}

/**
 * Calculates contrast color for text
 * @param {string} hexcolor - Hexadecimal color code
 * @returns {string} Black or white color code
 */
function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Adjusts color brightness
 * @param {string} color - Hexadecimal color code
 * @param {number} percent - Percentage to adjust
 * @returns {string} Adjusted color code
 */
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

/**
 * Handles form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const urlPattern = document.getElementById('urlPattern').value;
    const color = document.getElementById('themeColor').value;

    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentUrl = tabs[0]?.url;

        if (currentUrl) {
            const existingRule = await StorageManager.findMatchingRule(currentUrl);
            if (existingRule) {
                // Update existing rule
                const rules = await StorageManager.getAllRules();
                const index = rules.findIndex(rule => rule.url === existingRule.url);
                await StorageManager.updateRule(index, urlPattern, color);
            } else {
                // Add new rule
                await StorageManager.addRule(urlPattern, color);
            }
        }

        // Apply theme immediately
        await applyThemeToCurrentTab(color);

        // Close popup after short delay to show success
        setTimeout(() => window.close(), 300);
    } catch (error) {
        console.error('Error saving rule:', error);
        alert('Error saving rule. Please try again.');
    }
}

/**
 * Handles color picker changes
 */
async function handleColorChange(event) {
    const color = event.target.value;
    await applyThemeToCurrentTab(color);
}

/**
 * Opens the options page
 */
function openOptionsPage() {
    browser.runtime.openOptionsPage();
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentUrl();

    const colorPicker = document.getElementById('themeColor');
    const form = document.getElementById('ruleForm');
    const optionsLink = document.getElementById('openOptions');

    // Listen for real-time color changes
    colorPicker.addEventListener('input', handleColorChange);

    form.addEventListener('submit', handleFormSubmit);

    optionsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openOptionsPage();
    });
}); 