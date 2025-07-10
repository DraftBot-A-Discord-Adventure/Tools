// Statistics management component
class StatsManager {
    constructor(elements) {
        this.elements = elements;
    }

    // Met à jour les stats avec tous les items (utilisé au chargement initial)
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

    // Nouvelle méthode pour mettre à jour les stats avec les items filtrés/visibles
    updateVisibleStats(visibleItems, currentType) {
        // Compter les items visibles par type
        const counts = this.countItemsByType(visibleItems);
        
        // Mettre à jour l'affichage selon le type sélectionné
        if (currentType === 'all') {
            this.elements.weaponsCount.textContent = counts.weapons;
            this.elements.armorsCount.textContent = counts.armors;
            this.elements.objectsCount.textContent = counts.objects;
            this.elements.potionsCount.textContent = counts.potions;
        } else {
            // Quand un type spécifique est sélectionné, montrer le total pour ce type
            this.elements.weaponsCount.textContent = currentType === 'weapons' ? counts.weapons : '-';
            this.elements.armorsCount.textContent = currentType === 'armors' ? counts.armors : '-';
            this.elements.objectsCount.textContent = currentType === 'objects' ? counts.objects : '-';
            this.elements.potionsCount.textContent = currentType === 'potions' ? counts.potions : '-';
        }
        
        this.elements.totalCount.textContent = counts.total;

        // Mettre à jour la distribution de rareté avec les items visibles
        this.updateRarityStatsFromArray(visibleItems);
    }

    countItemsByType(items) {
        const counts = { weapons: 0, armors: 0, objects: 0, potions: 0, total: 0 };
        
        items.forEach(item => {
            switch(item.type) {
                case 'weapon':
                    counts.weapons++;
                    break;
                case 'armor':
                    counts.armors++;
                    break;
                case 'object':
                    counts.objects++;
                    break;
                case 'potion':
                    counts.potions++;
                    break;
            }
            counts.total++;
        });
        
        return counts;
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

        this.displayRarityStats(rarityDistribution);
    }

    // Nouvelle méthode pour calculer la rareté à partir d'un tableau d'items
    updateRarityStatsFromArray(items) {
        const rarityDistribution = {};
        
        // Initialize all rarities to 0
        for (let i = 0; i <= 8; i++) {
            rarityDistribution[i] = 0;
        }

        // Count items by rarity
        items.forEach(item => {
            if (typeof item.rarity === 'number') {
                rarityDistribution[item.rarity] = (rarityDistribution[item.rarity] || 0) + 1;
            }
        });

        this.displayRarityStats(rarityDistribution);
    }

    // Méthode commune pour afficher les stats de rareté
    displayRarityStats(rarityDistribution) {
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