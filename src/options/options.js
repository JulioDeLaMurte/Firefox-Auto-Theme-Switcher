import StorageManager from '../utils/storage.js';

/**
 * Creates a rule element from template
 * @param {Object} rule - Rule to display
 * @param {number} index - Rule index
 * @returns {HTMLElement} Created element
 */
function createRuleElement(rule, index) {
    const template = document.getElementById('ruleTemplate');
    const element = template.content.cloneNode(true).firstElementChild;

    // Fill rule information
    element.querySelector('.rule-url').textContent = rule.url;
    element.querySelector('.color-preview').style.backgroundColor = rule.color;
    element.querySelector('.color-value').textContent = rule.color;

    // Pre-fill edit form
    const editForm = element.querySelector('.edit-form');
    editForm.querySelector('.edit-url').value = rule.url;
    editForm.querySelector('.edit-color').value = rule.color;

    // Edit button handler
    element.querySelector('.edit-btn').addEventListener('click', () => {
        editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
    });

    // Cancel button handler
    element.querySelector('.cancel-btn').addEventListener('click', () => {
        editForm.style.display = 'none';
    });

    // Save button handler
    element.querySelector('.save-btn').addEventListener('click', async () => {
        const newUrl = editForm.querySelector('.edit-url').value;
        const newColor = editForm.querySelector('.edit-color').value;

        try {
            await StorageManager.updateRule(index, newUrl, newColor);
            await loadRules();
        } catch (error) {
            console.error('Error updating rule:', error);
            alert('Error updating rule. Please try again.');
        }
    });

    // Delete button handler
    element.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this rule?')) {
            try {
                await StorageManager.deleteRule(index);
                await loadRules();
            } catch (error) {
                console.error('Error deleting rule:', error);
                alert('Error deleting rule. Please try again.');
            }
        }
    });

    return element;
}

/**
 * Loads and displays all rules
 */
async function loadRules() {
    const rulesContainer = document.getElementById('rulesContainer');
    const rules = await StorageManager.getAllRules();

    // Clear container
    rulesContainer.innerHTML = '';

    if (rules.length === 0) {
        rulesContainer.innerHTML = `
            <div class="no-rules">
                No rules configured yet. Add rules from the extension popup.
            </div>
        `;
        return;
    }

    // Add each rule
    rules.forEach((rule, index) => {
        const element = createRuleElement(rule, index);
        rulesContainer.appendChild(element);
    });
}

// Initialize options page
document.addEventListener('DOMContentLoaded', loadRules); 