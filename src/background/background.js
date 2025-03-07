import StorageManager from '../utils/storage.js';

/**
 * Default theme colors
 */
const DEFAULT_THEME = {
    colors: {
        frame: '#ffffff',
        tab_background_text: '#000000',
        toolbar: '#f0f0f4',
        toolbar_text: '#000000'
    }
};

/**
 * Calculates contrast color (black or white) for a given color
 * @param {string} hexcolor - Color in hexadecimal format
 * @returns {string} Contrast color in hexadecimal format
 */
function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Applies a theme with the specified color
 * @param {string} color - Color in hexadecimal format
 */
async function applyTheme(color) {
    if (!color) {
        await browser.theme.reset();
        return;
    }

    const textColor = getContrastColor(color);
    const theme = {
        colors: {
            frame: color,
            tab_background_text: textColor,
            tab_selected: color,
            toolbar: color,
            toolbar_text: textColor,
            toolbar_field: adjustBrightness(color, 10),
            toolbar_field_text: textColor,
            tab_line: adjustBrightness(color, -20),
            popup: color,
            popup_text: textColor
        }
    };

    await browser.theme.update(theme);
}

/**
 * Adjusts color brightness
 * @param {string} color - Color in hexadecimal format
 * @param {number} percent - Percentage to adjust (-100 to 100)
 * @returns {string} Adjusted color in hexadecimal format
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
 * Updates theme based on active URL
 * @param {string} url - Active URL
 */
async function updateThemeForUrl(url) {
    try {
        const rule = await StorageManager.findMatchingRule(url);
        if (rule) {
            await applyTheme(rule.color);
        } else {
            await browser.theme.reset();
        }
    } catch (error) {
        console.error('Error updating theme:', error);
        await browser.theme.reset();
    }
}

/**
 * Handles active tab changes
 */
async function handleTabChange(activeInfo) {
    try {
        const tab = await browser.tabs.get(activeInfo.tabId);
        if (tab.url) {
            await updateThemeForUrl(tab.url);
        }
    } catch (error) {
        console.error('Error handling tab change:', error);
    }
}

/**
 * Handles tab URL updates
 */
async function handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.url && tab.active) {
        await updateThemeForUrl(changeInfo.url);
    }
}

/**
 * Handles messages
 */
browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'updateTheme' && message.url) {
        await updateThemeForUrl(message.url);
    }
    return true;
});

// Event listeners
browser.tabs.onActivated.addListener(handleTabChange);
browser.tabs.onUpdated.addListener(handleTabUpdate);

// Initialize theme for active tab
async function initializeTheme() {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
            await updateThemeForUrl(tabs[0].url);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Start the extension
initializeTheme(); 