/**
 * Module de gestion du stockage des règles URL-couleur
 */

const StorageManager = {
    /**
     * Récupère toutes les règles stockées
     * @returns {Promise<Array>} Liste des règles {url, color}
     */
    async getAllRules() {
        const result = await browser.storage.local.get('rules');
        return result.rules || [];
    },

    /**
     * Ajoute une nouvelle règle
     * @param {string} url - L'URL ou le motif d'URL
     * @param {string} color - La couleur au format hexadécimal
     * @returns {Promise<void>}
     */
    async addRule(url, color) {
        const rules = await this.getAllRules();
        rules.push({ url, color });
        await browser.storage.local.set({ rules });
    },

    /**
     * Met à jour une règle existante
     * @param {number} index - Index de la règle à modifier
     * @param {string} url - Nouvelle URL
     * @param {string} color - Nouvelle couleur
     * @returns {Promise<void>}
     */
    async updateRule(index, url, color) {
        const rules = await this.getAllRules();
        if (index >= 0 && index < rules.length) {
            rules[index] = { url, color };
            await browser.storage.local.set({ rules });
        }
    },

    /**
     * Supprime une règle
     * @param {number} index - Index de la règle à supprimer
     * @returns {Promise<void>}
     */
    async deleteRule(index) {
        const rules = await this.getAllRules();
        if (index >= 0 && index < rules.length) {
            rules.splice(index, 1);
            await browser.storage.local.set({ rules });
        }
    },

    /**
     * Trouve la règle correspondant à une URL donnée
     * @param {string} url - L'URL à tester
     * @returns {Promise<Object|null>} La règle correspondante ou null
     */
    async findMatchingRule(url) {
        const rules = await this.getAllRules();
        return rules.find(rule => {
            const pattern = rule.url.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(url);
        }) || null;
    }
};

export default StorageManager; 