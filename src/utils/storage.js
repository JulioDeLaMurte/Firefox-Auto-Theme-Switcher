/**
 * Storage management module for URL-color rules
 */

const StorageManager = {
    /**
     * Retrieves all stored rules
     * @returns {Promise<Array>} List of rules {url, color}
     */
    async getAllRules() {
        const result = await browser.storage.local.get('rules');
        return result.rules || [];
    },

    /**
     * Adds a new rule
     * @param {string} url - URL pattern to match
     * @param {string} color - Hexadecimal color code
     * @returns {Promise<void>}
     */
    async addRule(url, color) {
        const rules = await this.getAllRules();
        const normalizedUrl = this.normalizeUrlPattern(url);
        rules.push({ url: normalizedUrl, color });
        await browser.storage.local.set({ rules });
    },

    /**
     * Updates an existing rule
     * @param {number} index - Index of the rule to modify
     * @param {string} url - New URL pattern
     * @param {string} color - New color code
     * @returns {Promise<void>}
     */
    async updateRule(index, url, color) {
        const rules = await this.getAllRules();
        if (index >= 0 && index < rules.length) {
            const normalizedUrl = this.normalizeUrlPattern(url);
            rules[index] = { url: normalizedUrl, color };
            await browser.storage.local.set({ rules });
        }
    },

    /**
     * Deletes a rule
     * @param {number} index - Index of the rule to delete
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
     * Finds a rule matching the given URL
     * @param {string} url - URL to test
     * @returns {Promise<Object|null>} Matching rule or null
     */
    async findMatchingRule(url) {
        const rules = await this.getAllRules();
        return rules.find(rule => {
            const pattern = rule.url.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(url);
        }) || null;
    },

    /**
     * Normalizes URL pattern by ensuring proper wildcard format
     * @param {string} url - URL pattern to normalize
     * @returns {string} Normalized URL pattern
     * @private
     */
    normalizeUrlPattern(url) {
        let pattern = url.trim();

        // Ensure pattern starts with *:// if no protocol is specified
        if (!pattern.includes('://')) {
            pattern = `*://${pattern}`;
        }

        // Ensure pattern ends with /* if no path is specified
        if (pattern.endsWith('/')) {
            pattern += '*';
        } else if (!pattern.includes('/', pattern.indexOf('://') + 3)) {
            pattern += '/*';
        }

        return pattern;
    }
};

export default StorageManager; 