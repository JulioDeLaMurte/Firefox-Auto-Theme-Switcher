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
 * Applique un thème avec la couleur spécifiée
 * @param {string} color - Couleur au format hexadécimal
 */
async function applyTheme(color) {
    if (!color) {
        await browser.theme.reset();
        return;
    }

    // Calcule la couleur du texte (blanc ou noir) en fonction de la luminosité du fond
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const textColor = luminance > 0.5 ? '#000000' : '#ffffff';

    await browser.theme.update({
        colors: {
            frame: color,
            tab_background_text: textColor
        }
    });
}

/**
 * Met à jour le thème en fonction de l'URL active
 * @param {string} url - URL active
 */
async function updateThemeForUrl(url) {
    const rule = await StorageManager.findMatchingRule(url);
    if (rule) {
        await applyTheme(rule.color);
    } else {
        await browser.theme.reset();
    }
}

/**
 * Gestionnaire d'événement pour le changement d'onglet actif
 */
async function handleTabChange(activeInfo) {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab.url) {
        await updateThemeForUrl(tab.url);
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

// Écoute des événements
browser.tabs.onActivated.addListener(handleTabChange);
browser.tabs.onUpdated.addListener(handleTabUpdate);

// Initialisation du thème pour l'onglet actif au démarrage
async function initializeTheme() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
        await updateThemeForUrl(tabs[0].url);
    }
}

initializeTheme(); 