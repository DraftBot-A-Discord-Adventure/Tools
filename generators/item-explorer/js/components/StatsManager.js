// Statistics management component
class StatsManager {
    constructor(elements) {
        this.elements = elements;
    }

    updateStats(allItems) {
        const weaponsCount = allItems.weapons ? allItems.weapons.length : 0;
        const armorsCount = allItems.armors ? allItems.armors.length : 0;
        const objectsCount = allItems.objects ? allItems.objects.length : 0;
        const potionsCount = allItems.potions ? allItems.potions.length : 0;
        const totalCount = weaponsCount + armorsCount + objectsCount + potionsCount;

        this.elements.weaponsCount.textContent = weaponsCount;
        this.elements.armorsCount.textContent = armorsCount;
        this.elements.objectsCount.textContent = objectsCount;
        this.elements.potionsCount.textContent = potionsCount;
        this.elements.totalCount.textContent = totalCount;

        this.updateRarityStats(allItems);
    }

    updateRarityStats(allItems) {
        const rarityDistribution = {};
        
        // Initialize all rarities to 0
        for (let i = 0; i <= 8; i++) {
            rarityDistribution[i] = 0;
        }

        // Count items by rarity
        Object.values(allItems).forEach(itemArray => {
            if (Array.isArray(itemArray)) {
                itemArray.forEach(item => {
                    if (typeof item.rarity === 'number') {
                        rarityDistribution[item.rarity] = (rarityDistribution[item.rarity] || 0) + 1;
                    }
                });
            }
        });

        // Display the distribution
        this.elements.rarityStats.innerHTML = '';
        
        Object.entries(rarityDistribution).forEach(([rarity, count]) => {
            if (count > 0) {
                const rarityName = CONSTANTS.RARITY_NAMES[parseInt(rarity)] || `Rarity ${rarity}`;
                const div = document.createElement('div');
                div.className = `rarity-stat rarity-${rarity}`;
                div.innerHTML = `<span class="rarity-name">${rarityName} (${rarity})</span>: <span class="rarity-count">${count}</span>`;
                this.elements.rarityStats.appendChild(div);
            }
        });
    }
}