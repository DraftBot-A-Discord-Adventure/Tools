// Icon service for loading and managing Crownicles icons
class IconService {
    constructor(elements) {
        this.elements = elements;
        this.crowniclesIcons = EMOJI_CONFIG.DEFAULT_ICONS;
    }

    async loadCrowniclesIcons(branch) {
        try {
            this.elements.loadingStatus.textContent = 'Loading Crownicles icons...';
            
            const response = await fetch(`https://raw.githubusercontent.com/Crownicles/Crownicles/${branch}/Lib/src/CrowniclesIcons.ts`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch CrowniclesIcons file: ${response.status}`);
            }
            
            const iconsData = await response.text();
            Object.assign(this.crowniclesIcons, EMOJI_CONFIG.DEFAULT_ICONS);
            
            // Extract arrays first
            this.extractArrays(iconsData);
            
            // Extract objects
            this.extractObjects(iconsData);
            
            console.log('Loaded Crownicles icons with improved parsing:', {
                rarity: this.crowniclesIcons.rarity.length,
                itemNatures: this.crowniclesIcons.itemNatures.length,
                itemCategories: this.crowniclesIcons.itemCategories.length,
                weapons: Object.keys(this.crowniclesIcons.weapons).length,
                armors: Object.keys(this.crowniclesIcons.armors).length,
                objects: Object.keys(this.crowniclesIcons.objects).length,
                potions: Object.keys(this.crowniclesIcons.potions).length
            });
            
        } catch (error) {
            console.warn('Failed to load Crownicles icons:', error);
            this.setFallbackIcons();
        }
    }

    extractArrays(text) {
        const extractArray = (arrayName) => {
            const regex = new RegExp(`${arrayName}\\s*:\\s*\\[(.*?)\\]`, 's');
            const match = text.match(regex);
            
            if (!match || !match[1]) return [];
            
            if (match[1].includes('"') || match[1].includes("'")) {
                const items = [];
                let currentItem = '';
                let inQuote = false;
                let quoteChar = '';
                
                for (let i = 0; i < match[1].length; i++) {
                    const char = match[1][i];
                    
                    if ((char === '"' || char === "'") && (i === 0 || match[1][i-1] !== '\\')) {
                        if (!inQuote) {
                            inQuote = true;
                            quoteChar = char;
                        } else if (char === quoteChar) {
                            inQuote = false;
                        }
                    }
                    
                    if (char === ',' && !inQuote) {
                        items.push(currentItem.trim());
                        currentItem = '';
                    } else {
                        currentItem += char;
                    }
                }
                
                if (currentItem.trim()) {
                    items.push(currentItem.trim());
                }
                
                return items.map(item => {
                    item = item.trim();
                    if ((item.startsWith('"') && item.endsWith('"')) || 
                        (item.startsWith("'") && item.endsWith("'"))) {
                        return item.substring(1, item.length - 1);
                    }
                    return item;
                });
            }
            
            return [];
        };

        try {
            const rarityArray = extractArray('rarity');
            if (rarityArray.length > 0) {
                this.crowniclesIcons.rarity = rarityArray;
            }
            
            const itemNaturesArray = extractArray('itemNatures');
            if (itemNaturesArray.length > 0) {
                this.crowniclesIcons.itemNatures = itemNaturesArray;
            }
            
            const itemCategoriesArray = extractArray('itemCategories');
            if (itemCategoriesArray.length > 0) {
                this.crowniclesIcons.itemCategories = itemCategoriesArray;
            }
        } catch (e) {
            console.warn('Error extracting arrays:', e);
        }
    }

    extractObjects(text) {
        const extractSpecificSection = (sectionName) => {
            const regex = new RegExp(`${sectionName}\\s*:\\s*\\{([\\s\\S]*?)\\}(?=,\\s*\\w+:|\\s*\\}\\s*$)`, 'm');
            const match = text.match(regex);
            
            if (!match || !match[1]) return {};
            
            const result = {};
            const lines = match[1].split('\n');
            
            for (const line of lines) {
                const keyValueMatch = line.match(/\s*(\w+)\s*:\s*(?:["'])(.*?)(?:["'])\s*,?/);
                if (keyValueMatch) {
                    const [, key, value] = keyValueMatch;
                    result[key] = value;
                }
            }
            
            return result;
        };

        try {
            const sections = ['weapons', 'armors', 'objects', 'potions'];
            sections.forEach(section => {
                const extracted = extractSpecificSection(section);
                if (Object.keys(extracted).length > 0) {
                    this.crowniclesIcons[section] = extracted;
                }
            });
        } catch (e) {
            console.warn('Error extracting objects:', e);
        }
    }

    setFallbackIcons() {
        this.crowniclesIcons = EMOJI_CONFIG.DEFAULT_ICONS;
    }

    getItemEmoji(item) {
        const typeMap = {
            'weapon': 'weapons',
            'armor': 'armors', 
            'object': 'objects',
            'potion': 'potions'
        };
        
        const iconType = typeMap[item.type];
        
        // Try to get specific icon first
        if (iconType && this.crowniclesIcons[iconType] && this.crowniclesIcons[iconType][item.id]) {
            return this.crowniclesIcons[iconType][item.id];
        }
        
        // If no specific icon, try fallbacks based on rarity and type
        if (item.rarity >= 0 && item.rarity <= 8) {
            if (EMOJI_CONFIG.RARITY_BASED_EMOJIS[item.type]) {
                return EMOJI_CONFIG.RARITY_BASED_EMOJIS[item.type][item.rarity];
            }
        }
        
        // Last fallback to category emoji
        return this.getCategoryEmoji(item.type);
    }

    getCategoryEmoji(type) {
        const categoryMap = {
            'weapon': 0,   // ⚔️
            'armor': 1,    // 🛡️  
            'potion': 2,   // ⚗️
            'object': 3    // 🧸
        };
        
        const categoryIndex = categoryMap[type];
        
        // If we have category emojis loaded, use them
        if (this.crowniclesIcons.itemCategories && this.crowniclesIcons.itemCategories.length > categoryIndex) {
            return this.crowniclesIcons.itemCategories[categoryIndex];
        }
        
        // Otherwise use hardcoded fallbacks
        return EMOJI_CONFIG.FALLBACK_CATEGORY_EMOJIS[categoryIndex] || '📦';
    }

    getRarityEmoji(rarity) {
        return this.crowniclesIcons.rarity[rarity] || '';
    }

    getNatureEmoji(nature) {
        return this.crowniclesIcons.itemNatures[nature] || '';
    }
}