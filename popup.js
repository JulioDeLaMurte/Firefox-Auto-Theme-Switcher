import StorageManager from './storage.js';

/**
 * Met à jour l'affichage de l'URL active
 */
async function updateCurrentUrl() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const urlElement = document.getElementById('currentUrl');

    if (currentTab && currentTab.url) {
        urlElement.textContent = `URL active : ${currentTab.url}`;

        // Pré-remplir le champ URL avec un motif basé sur l'URL actuelle
        const urlPattern = document.getElementById('urlPattern');
        const url = new URL(currentTab.url);
        urlPattern.value = `*://${url.hostname}/*`;

        // Vérifier si une règle existe déjà pour cette URL
        const rule = await StorageManager.findMatchingRule(currentTab.url);
        if (rule) {
            document.getElementById('themeColor').value = rule.color;
        }
    } else {
        urlElement.textContent = 'Aucun onglet actif';
    }
}

/**
 * Applique le thème à l'onglet actif
 */
async function applyThemeToCurrentTab(color) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        await browser.theme.update({
            colors: {
                frame: color,
                tab_background_text: getContrastColor(color)
            }
        });
    }
}

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
 * Gestionnaire de soumission du formulaire
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const urlPattern = document.getElementById('urlPattern').value;
    const color = document.getElementById('themeColor').value;

    try {
        await StorageManager.addRule(urlPattern, color);

        // Appliquer immédiatement le thème
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url) {
            await applyThemeToCurrentTab(color);
        }

        // Réinitialiser le formulaire et fermer le popup
        event.target.reset();
        window.close();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la règle:', error);
    }
}

/**
 * Gestionnaire de changement de couleur
 */
async function handleColorChange(event) {
    const color = event.target.value;
    await applyThemeToCurrentTab(color);
}

/**
 * Ouvre la page des options
 */
function openOptionsPage() {
    browser.runtime.openOptionsPage();
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentUrl();

    const colorPicker = document.getElementById('themeColor');
    const form = document.getElementById('ruleForm');
    const optionsLink = document.getElementById('openOptions');

    // Écouter les changements de couleur en temps réel
    colorPicker.addEventListener('input', handleColorChange);

    form.addEventListener('submit', handleFormSubmit);

    optionsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openOptionsPage();
    });
}); 