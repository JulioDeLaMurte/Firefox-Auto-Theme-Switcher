import StorageManager from './storage.js';

/**
 * Crée un élément de règle à partir du template
 * @param {Object} rule - La règle à afficher
 * @param {number} index - L'index de la règle
 * @returns {HTMLElement} L'élément créé
 */
function createRuleElement(rule, index) {
    const template = document.getElementById('ruleTemplate');
    const element = template.content.cloneNode(true).firstElementChild;

    // Remplir les informations de la règle
    element.querySelector('.rule-url').textContent = rule.url;
    element.querySelector('.color-preview').style.backgroundColor = rule.color;
    element.querySelector('.color-value').textContent = rule.color;

    // Pré-remplir le formulaire d'édition
    const editForm = element.querySelector('.edit-form');
    editForm.querySelector('.edit-url').value = rule.url;
    editForm.querySelector('.edit-color').value = rule.color;

    // Gestionnaire pour le bouton d'édition
    element.querySelector('.edit-btn').addEventListener('click', () => {
        editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
    });

    // Gestionnaire pour le bouton d'annulation
    element.querySelector('.cancel-btn').addEventListener('click', () => {
        editForm.style.display = 'none';
    });

    // Gestionnaire pour le bouton de sauvegarde
    element.querySelector('.save-btn').addEventListener('click', async () => {
        const newUrl = editForm.querySelector('.edit-url').value;
        const newColor = editForm.querySelector('.edit-color').value;

        try {
            await StorageManager.updateRule(index, newUrl, newColor);
            await loadRules(); // Recharger toutes les règles
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la règle:', error);
        }
    });

    // Gestionnaire pour le bouton de suppression
    element.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) {
            try {
                await StorageManager.deleteRule(index);
                await loadRules(); // Recharger toutes les règles
            } catch (error) {
                console.error('Erreur lors de la suppression de la règle:', error);
            }
        }
    });

    return element;
}

/**
 * Charge et affiche toutes les règles
 */
async function loadRules() {
    const rulesContainer = document.getElementById('rulesContainer');
    const rules = await StorageManager.getAllRules();

    // Vider le conteneur
    rulesContainer.innerHTML = '';

    if (rules.length === 0) {
        rulesContainer.innerHTML = `
      <div class="no-rules">
        Aucune règle configurée
      </div>
    `;
        return;
    }

    // Ajouter chaque règle
    rules.forEach((rule, index) => {
        const element = createRuleElement(rule, index);
        rulesContainer.appendChild(element);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', loadRules); 