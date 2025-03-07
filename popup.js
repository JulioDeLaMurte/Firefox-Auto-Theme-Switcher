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
 * Gestionnaire de soumission du formulaire
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const urlPattern = document.getElementById('urlPattern').value;
    const color = document.getElementById('themeColor').value;

    try {
        await StorageManager.addRule(urlPattern, color);

        // Appliquer immédiatement le thème si l'URL active correspond
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url) {
            const rule = await StorageManager.findMatchingRule(tabs[0].url);
            if (rule) {
                await browser.runtime.sendMessage({
                    type: 'updateTheme',
                    url: tabs[0].url
                });
            }
        }

        // Réinitialiser le formulaire
        event.target.reset();
        window.close();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la règle:', error);
    }
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
    document.getElementById('ruleForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('openOptions').addEventListener('click', (e) => {
        e.preventDefault();
        openOptionsPage();
    });
}); 