// Item calculation utilities
class ItemCalculator {
    calculateStats(item, type) {
        switch (type) {
            case 'weapons':
                this.calculateWeaponStats(item);
                break;
            case 'armors':
                this.calculateArmorStats(item);
                break;
            case 'objects':
                this.calculateObjectStats(item);
                break;
            case 'potions':
                this.calculatePotionStats(item);
                break;
        }
    }

    calculateWeaponStats(item) {
        const multiplier = CONSTANTS.RARITY_MULTIPLIERS[item.rarity] || 1;
        
        item.rawAttack = item.rawAttack || 0;
        item.rawDefense = 0;
        
        // Sauvegarder la valeur d'attaque originale AVANT qu'elle soit modifiée
        const originalAttack = item.attack || 0;
        
        // Toujours calculer l'attaque avec la formule, même si rawAttack est 0
        const calculatedAttack = Math.round(1.15053 * Math.pow(multiplier, 2.3617) * 
                                          Math.pow(1.0569 + 0.1448 / multiplier, item.rawAttack));
        
        // Utiliser la valeur calculée + bonus originaux
        item.attack = calculatedAttack + originalAttack;
        
        item.defense = item.defense || 0;
        item.speed = item.speed || 0;
    }

    calculateArmorStats(item) {
        const multiplier = CONSTANTS.RARITY_MULTIPLIERS[item.rarity] || 1;
        
        item.rawAttack = item.rawAttack || 0;
        item.rawDefense = item.rawDefense || 0;
        
        item.attack = item.attack || 0;
        
        // Sauvegarder la valeur de défense originale AVANT qu'elle soit modifiée
        const originalDefense = item.defense || 0;
        
        // Toujours calculer la défense avec la formule, même si rawDefense est 0
        const calculatedDefense = Math.round(1.15053 * Math.pow(multiplier, 2.3617) * 
                                           Math.pow(1.0569 + 0.1448 / multiplier, item.rawDefense));
        
        // Utiliser la valeur calculée + bonus originaux
        item.defense = calculatedDefense + originalDefense;
        
        item.speed = item.speed || 0;
    }

    calculateObjectStats(item) {
        item.power = item.power || 0;
        item.nature = item.nature || 0;
        
        if (item.nature === 3) { // ATTACK
            item.finalAttack = item.power;
            item.finalDefense = 0;
            item.finalSpeed = 0;
        } else if (item.nature === 4) { // DEFENSE
            item.finalAttack = 0;
            item.finalDefense = item.power;
            item.finalSpeed = 0;
        } else if (item.nature === 2) { // SPEED
            item.finalAttack = 0;
            item.finalDefense = 0;
            item.finalSpeed = item.power;
        } else {
            item.finalAttack = 0;
            item.finalDefense = 0;
            item.finalSpeed = 0;
        }
    }

    calculatePotionStats(item) {
        item.power = item.power || 0;
        item.nature = item.nature || 0;
        
        if (item.nature === 3) { // ATTACK
            item.finalAttack = item.power;
            item.finalDefense = 0;
            item.finalSpeed = 0;
        } else if (item.nature === 4) { // DEFENSE
            item.finalAttack = 0;
            item.finalDefense = item.power;
            item.finalSpeed = 0;
        } else if (item.nature === 2) { // SPEED
            item.finalAttack = 0;
            item.finalDefense = 0;
            item.finalSpeed = item.power;
        } else {
            item.finalAttack = 0;
            item.finalDefense = 0;
            item.finalSpeed = 0;
        }
    }
}