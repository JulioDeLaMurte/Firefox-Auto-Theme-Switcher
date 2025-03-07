import StorageManager from './storage.js';

/**
 * Couleurs par défaut du thème
 */
const DEFAULT_THEME = {
    colors: {
        frame: '#ffffff',
        tab_background_text: '#000000'
    }
};

/**
 * Calcule la couleur de contraste (noir ou blanc) pour une couleur donnée
 */
function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Applique un thème avec la couleur spécifiée
 * @param {string} color - Couleur au format hexadécimal
 */
async function applyTheme(color) {
    if (!color) {
        await browser.theme.reset();
        return;
    }

    await browser.theme.update({
        colors: {
            frame: color,
            tab_background_text: getContrastColor(color),
            tab_selected: color,
            toolbar: color,
            toolbar_text: getContrastColor(color)
        }
    });
}

/**
 * Met à jour le thème en fonction de l'URL active
 * @param {string} url - URL active
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
        console.error('Erreur lors de la mise à jour du thème:', error);
        await browser.theme.reset();
    }
}

/**
 * Gestionnaire d'événement pour le changement d'onglet actif
 */
async function handleTabChange(activeInfo) {
    try {
        const tab = await browser.tabs.get(activeInfo.tabId);
        if (tab.url) {
            await updateThemeForUrl(tab.url);
        }
    } catch (error) {
        console.error('Erreur lors du changement d\'onglet:', error);
    }
}

/**
 * Gestionnaire d'événement pour la mise à jour d'un onglet
 */
async function handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.url && tab.active) {
        await updateThemeForUrl(changeInfo.url);
    }
}

/**
 * Gestionnaire de messages
 */
browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'updateTheme' && message.url) {
        await updateThemeForUrl(message.url);
    }
    return true;
});

// Écoute des événements
browser.tabs.onActivated.addListener(handleTabChange);
browser.tabs.onUpdated.addListener(handleTabUpdate);

// Initialisation du thème pour l'onglet actif au démarrage
async function initializeTheme() {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url) {
            await updateThemeForUrl(tabs[0].url);
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Initialisation
initializeTheme(); 