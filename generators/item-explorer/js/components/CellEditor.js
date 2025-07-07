// Cell editing component
class CellEditor {
    constructor(elements) {
        this.elements = elements;
        this.modifiedCells = new Map(); // Store original values and track modifications
        this.nextNewId = 10000; // Starting ID for new items
        this.highlightModifications = false;
        this.activeDropdown = null; // Track active dropdown
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Toggle for highlighting modifications
        const highlightToggle = document.getElementById('highlight-modifications');
        if (highlightToggle) {
            highlightToggle.addEventListener('change', (e) => {
                this.highlightModifications = e.target.checked;
                this.updateModificationHighlights();
            });
        }

        // Add row button
        const addRowBtn = document.getElementById('add-row-btn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                this.addNewRow();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeDropdown && 
                !this.activeDropdown.contains(e.target) && 
                !e.target.closest('.editable-cell')) {
                this.closeActiveDropdown();
            }
        });
    }

    // Make specific cells editable
    makeCellsEditable(row, item) {
        const cells = row.querySelectorAll('td');
        
        // Define editable columns based on item type
        let editableColumns = [];
        let calculatedColumns = [];
        
        if (item.type === 'weapon') {
            // Weapons: rawAttack, defense, speed (+ common fields)
            editableColumns = [2, 3, 4, 5, 8, 9, 13]; // name, rarity, type, rawAttack, defense, speed, tags
            calculatedColumns = [7, 12]; // attack (calculé), performance
        } else if (item.type === 'armor') {
            // Armors: rawDefense, attack, speed (+ common fields)  
            editableColumns = [2, 3, 4, 6, 7, 9, 13]; // name, rarity, type, rawDefense, attack, speed, tags
            calculatedColumns = [8, 12]; // defense (calculé), performance
        } else if (item.type === 'object' || item.type === 'potion') {
            // Objects/Potions: power, nature, rarity (+ common fields)
            editableColumns = [2, 3, 4, 10, 11, 13]; // name, rarity, type, nature, power, tags
            calculatedColumns = [7, 8, 9, 12]; // attack, defense, speed (calculés), performance
        } else {
            // Fallback - tous les champs éditables par défaut
            editableColumns = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13];
            calculatedColumns = [12]; // performance
        }
        
        const nonEditableColumns = [0, 1]; // ID, emoji - toujours non éditables
        
        cells.forEach((cell, index) => {
            if (editableColumns.includes(index)) {
                this.makeEditable(cell, item, index);
            } else if (calculatedColumns.includes(index)) {
                cell.classList.add('non-editable');
                cell.title = 'Ce champ est calculé automatiquement';
            } else if (nonEditableColumns.includes(index)) {
                cell.classList.add('non-editable');
                cell.title = 'Ce champ n\'est pas éditable';
            } else {
                // Autres colonnes non éditables pour ce type d'item
                cell.classList.add('non-editable');
                cell.title = `Ce champ n'est pas éditable pour les ${item.type}s`;
            }
        });
    }

    makeEditable(cell, item, columnIndex) {
        cell.classList.add('editable-cell');
        cell.title = 'Cliquez pour éditer';

        // Add visual styling based on column type
        this.addColumnStyling(cell, columnIndex);

        // Store original value based on what's ACTUALLY displayed in the cell
        const cellKey = `${item.id}-${columnIndex}`;
        if (!this.modifiedCells.has(cellKey)) {
            // Use the actual displayed content as the original value
            // This ensures perfect matching between original and current values
            const originalValue = cell.textContent.trim();
            
            this.modifiedCells.set(cellKey, {
                originalValue: originalValue,
                item: item,
                columnIndex: columnIndex
            });
        }

        // Add event listeners based on column type
        if (this.isDropdownColumn(columnIndex)) {
            cell.addEventListener('click', (e) => this.showDropdown(e, item, columnIndex));
        } else {
            cell.contentEditable = true;
            cell.addEventListener('blur', (e) => this.handleCellEdit(e, item, columnIndex));
            cell.addEventListener('keydown', (e) => this.handleKeyDown(e, item, columnIndex));
            cell.addEventListener('input', (e) => this.handleInput(e, columnIndex));
        }
    }

    addColumnStyling(cell, columnIndex) {
        switch (columnIndex) {
            case 3: // rarity
                cell.classList.add('rarity-input');
                break;
            case 4: // type
                cell.classList.add('type-input');
                break;
            case 5: case 6: case 7: case 8: case 9: case 11: // numeric fields (ajout de 7, 8, 9)
                cell.classList.add('numeric-input');
                break;
            case 10: // nature
                cell.classList.add('nature-input');
                break;
        }
    }

    isDropdownColumn(columnIndex) {
        return [3, 4, 10].includes(columnIndex); // rarity, type, nature
    }

    showDropdown(event, item, columnIndex) {
        event.preventDefault();
        this.closeActiveDropdown();

        const cell = event.target;
        const dropdown = this.createDropdown(columnIndex, item);
        
        cell.style.position = 'relative';
        cell.appendChild(dropdown);
        
        this.activeDropdown = dropdown;
        dropdown.classList.add('show');

        // Position dropdown
        setTimeout(() => {
            const rect = cell.getBoundingClientRect();
            const tableContainer = cell.closest('.table-container');
            const containerRect = tableContainer.getBoundingClientRect();
            
            if (rect.bottom + dropdown.offsetHeight > containerRect.bottom) {
                dropdown.style.top = 'auto';
                dropdown.style.bottom = '100%';
            }
        }, 0);
    }

    createDropdown(columnIndex, item) {
        const dropdown = document.createElement('div');
        dropdown.className = 'cell-dropdown';

        let options = [];
        let currentValue = '';

        switch (columnIndex) {
            case 3: // rarity
                options = [
                    { value: 0, label: '⚪ Basic (0)', emoji: '⚪' },
                    { value: 1, label: '⚫ Common (1)', emoji: '⚫' },
                    { value: 2, label: '🟢 Uncommon (2)', emoji: '🟢' },
                    { value: 3, label: '🔵 Exotic (3)', emoji: '🔵' },
                    { value: 4, label: '🟣 Rare (4)', emoji: '🟣' },
                    { value: 5, label: '🟠 Special (5)', emoji: '🟠' },
                    { value: 6, label: '🟡 Epic (6)', emoji: '🟡' },
                    { value: 7, label: '🔴 Legendary (7)', emoji: '🔴' },
                    { value: 8, label: '🟢 Mythical (8)', emoji: '🟢' }
                ];
                currentValue = item.rarity;
                break;
            case 4: // type
                options = [
                    { value: 'weapon', label: '⚔️ Weapon', emoji: '⚔️' },
                    { value: 'armor', label: '🛡️ Armor', emoji: '🛡️' },
                    { value: 'object', label: '🧸 Object', emoji: '🧸' },
                    { value: 'potion', label: '⚗️ Potion', emoji: '⚗️' }
                ];
                currentValue = item.type;
                break;
            case 10: // nature
                options = [
                    { value: 0, label: '🔶 None (0)', emoji: '🔶' },
                    { value: 1, label: '❤️ Health (1)', emoji: '❤️' },
                    { value: 2, label: '💨 Speed (2)', emoji: '💨' },
                    { value: 3, label: '⚔️ Attack (3)', emoji: '⚔️' },
                    { value: 4, label: '🛡️ Defense (4)', emoji: '🛡️' },
                    { value: 5, label: '⏰ Time Speedup (5)', emoji: '⏰' },
                    { value: 6, label: '💰 Money (6)', emoji: '💰' },
                    { value: 7, label: '⚡ Energy (7)', emoji: '⚡' }
                ];
                currentValue = item.nature || 0;
                break;
        }

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'dropdown-option';
            if (option.value == currentValue) {
                optionDiv.classList.add('selected');
            }
            optionDiv.innerHTML = option.label;
            optionDiv.addEventListener('click', () => {
                this.selectDropdownOption(item, columnIndex, option);
            });
            dropdown.appendChild(optionDiv);
        });

        return dropdown;
    }

    selectDropdownOption(item, columnIndex, option) {
        const cell = this.activeDropdown.parentElement;
        const cellKey = `${item.id}-${columnIndex}`;
        const originalData = this.modifiedCells.get(cellKey);

        // Update cell display
        cell.textContent = option.label;

        // Update item data
        switch (columnIndex) {
            case 3: // rarity
                item.rarity = option.value;
                break;
            case 4: // type
                item.type = option.value;
                break;
            case 10: // nature
                item.nature = option.value;
                break;
        }

        // Mark as modified if different from original
        if (originalData && option.label !== originalData.originalValue) {
            originalData.isModified = true;
            originalData.currentValue = option.label;
            if (this.highlightModifications) {
                cell.classList.add('modified-cell');
            }
        } else if (originalData) {
            originalData.isModified = false;
            delete originalData.currentValue;
            cell.classList.remove('modified-cell');
        }

        // Trigger recalculation
        this.recalculateItemStats(item);
        this.updateRelatedCells(item);

        this.closeActiveDropdown();
    }

    closeActiveDropdown() {
        if (this.activeDropdown) {
            this.activeDropdown.remove();
            this.activeDropdown = null;
        }
    }

    handleKeyDown(event, item, columnIndex) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEdit(event.target, item, columnIndex);
        }
    }

    handleInput(event, columnIndex) {
        const cell = event.target;
        const value = cell.textContent.trim();

        // Numeric validation for numeric fields (ajout de 7, 8, 9)
        if ([5, 6, 7, 8, 9, 11].includes(columnIndex)) { // rawAttack, rawDefense, attack, defense, speed, power
            // Remove non-numeric characters
            const numericValue = value.replace(/[^0-9]/g, '');
            if (value !== numericValue) {
                cell.textContent = numericValue;
                // Move cursor to end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(cell);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        this.validateInput(event, columnIndex);
    }

    handleCellEdit(event, item, columnIndex) {
        const cell = event.target;
        const newValue = cell.textContent.trim();
        const cellKey = `${item.id}-${columnIndex}`;
        const originalData = this.modifiedCells.get(cellKey);

        if (!originalData) return;

        // Validate before saving
        if (!this.validateInput(event, columnIndex)) {
            // If invalid, revert to original value
            cell.textContent = originalData.originalValue;
            return;
        }

        // Check if value changed
        if (newValue !== originalData.originalValue) {
            // Update the item data
            this.updateItemData(item, columnIndex, newValue);
            
            // Mark as modified
            if (this.highlightModifications) {
                cell.classList.add('modified-cell');
            }
            
            // Store the modification
            originalData.isModified = true;
            originalData.currentValue = newValue;
            
            // Trigger recalculation if needed
            this.recalculateItemStats(item);
            
            // Update the display
            this.updateRelatedCells(item);
            
        } else {
            // Value unchanged, remove modification marker
            cell.classList.remove('modified-cell');
            if (originalData.isModified) {
                originalData.isModified = false;
                delete originalData.currentValue;
            }
        }

        // Remove validation errors
        cell.classList.remove('invalid-input');
        const errorDiv = cell.querySelector('.validation-error');
        if (errorDiv) errorDiv.remove();
    }

    updateItemData(item, columnIndex, value) {
        switch (columnIndex) {
            case 2: // name
                item.name = value;
                break;
            case 5: // rawAttack
                item.rawAttack = parseInt(value) || 0;
                break;
            case 6: // rawDefense
                item.rawDefense = parseInt(value) || 0;
                break;
            case 7: // attack (éditable pour les armures)
                item.attack = parseInt(value) || 0;
                break;
            case 8: // defense (éditable pour les armes)
                item.defense = parseInt(value) || 0;
                break;
            case 9: // speed (éditable pour armes et armures)
                item.speed = parseInt(value) || 0;
                break;
            case 11: // power
                item.power = parseInt(value) || 0;
                break;
            case 13: // tags
                item.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                break;
        }
    }

    validateInput(event, columnIndex) {
        const cell = event.target;
        const value = cell.textContent.trim();
        let isValid = true;
        let errorMessage = '';

        // Validation based on column type
        switch (columnIndex) {
            case 2: // name
                if (!value || value.length < 1) {
                    isValid = false;
                    errorMessage = 'Name cannot be empty';
                }
                break;
            case 5: case 6: case 7: case 8: case 9: case 11: // numeric fields (ajout de 7, 8, 9)
                if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
                    isValid = false;
                    errorMessage = 'Must be a positive number';
                }
                break;
            case 13: // tags
                // Tags are always valid
                break;
        }

        // Show/hide validation error
        if (!isValid) {
            cell.classList.add('invalid-input');
            this.showValidationError(cell, errorMessage);
        } else {
            cell.classList.remove('invalid-input');
            this.hideValidationError(cell);
        }

        return isValid;
    }

    recalculateItemStats(item) {
        // Recalculate final stats based on raw stats and item properties
        const calculator = new ItemCalculator();
        
        // Calculate final stats based on item type and properties
        if (item.type === 'weapon') {
            item.attack = calculator.calculateWeaponAttack(item);
            item.finalAttack = item.attack;
            item.defense = calculator.calculateWeaponDefense(item);
            item.finalDefense = item.defense;
            item.speed = calculator.calculateWeaponSpeed(item);
            item.finalSpeed = item.speed;
        } else if (item.type === 'armor') {
            item.attack = calculator.calculateArmorAttack(item);
            item.finalAttack = item.attack;
            item.defense = calculator.calculateArmorDefense(item);
            item.finalDefense = item.defense;
            item.speed = calculator.calculateArmorSpeed(item);
            item.finalSpeed = item.speed;
        } else if (item.type === 'object') {
            item.finalAttack = calculator.calculateObjectFinalAttack(item);
            item.finalDefense = calculator.calculateObjectFinalDefense(item);
            item.finalSpeed = calculator.calculateObjectFinalSpeed(item);
        } else if (item.type === 'potion') {
            item.finalAttack = calculator.calculatePotionFinalAttack(item);
            item.finalDefense = calculator.calculatePotionFinalDefense(item);
            item.finalSpeed = calculator.calculatePotionFinalSpeed(item);
        }

        // Ne PAS déclencher updateDisplay() qui recrée tout le tableau
        // updateRelatedCells() s'occupe déjà de mettre à jour les cellules calculées
    }

    updateRelatedCells(item) {
        // Find and update calculated cells that might be affected by the change
        const rows = document.querySelectorAll(`#items-table tbody tr`);
        rows.forEach(row => {
            const idCell = row.querySelector('td:first-child');
            const typeCell = row.querySelector('td:nth-child(5)'); // Type column
            
            // Vérifier à la fois l'ID ET le type pour éviter les conflits
            if (idCell && typeCell && 
                idCell.textContent.trim() == item.id && 
                typeCell.textContent.trim() === item.type) {
                
                // Update calculated fields
                const cells = row.querySelectorAll('td');
                if (cells[7]) cells[7].textContent = item.attack || item.finalAttack || 0; // attack
                if (cells[8]) cells[8].textContent = item.defense || item.finalDefense || 0; // defense
                if (cells[9]) cells[9].textContent = item.speed || item.finalSpeed || 0; // speed
                
                // Ne PAS mettre à jour automatiquement la rareté et la nature
                // Ces mises à jour ne se font que quand l'utilisateur modifie explicitement ces champs
                // via les dropdowns, pas lors du recalcul des stats
            }
        });
    }

    getRarityEmoji(rarity) {
        const rarityEmojis = ['⚪', '⚫', '🟢', '🔵', '🟣', '🟠', '🟡', '🔴', '🟢'];
        return rarityEmojis[rarity] || '❓';
    }

    getNatureEmoji(nature) {
        const natureEmojis = ['🔶', '❤️', '💨', '⚔️', '🛡️', '⏰', '💰', '⚡'];
        return natureEmojis[nature] || '🔶';
    }

    // Get all modifications for export/save
    getModifications() {
        const modifications = {};
        this.modifiedCells.forEach((data, cellKey) => {
            if (data.isModified) {
                const [itemId, columnIndex] = cellKey.split('-');
                if (!modifications[itemId]) {
                    modifications[itemId] = {};
                }
                modifications[itemId][columnIndex] = {
                    originalValue: data.originalValue,
                    currentValue: data.currentValue
                };
            }
        });
        return modifications;
    }

    // Clear all modifications
    clearModifications() {
        this.modifiedCells.clear();
        const modifiedCells = document.querySelectorAll('.modified-cell');
        modifiedCells.forEach(cell => cell.classList.remove('modified-cell'));
    }

    // Missing methods that were referenced but not implemented
    enableAddButton() {
        const addRowBtn = document.getElementById('add-row-btn');
        if (addRowBtn) {
            addRowBtn.disabled = false;
        }
    }

    disableAddButton() {
        const addRowBtn = document.getElementById('add-row-btn');
        if (addRowBtn) {
            addRowBtn.disabled = true;
        }
    }

    cancelEdit(cell, item, columnIndex) {
        const cellKey = `${item.id}-${columnIndex}`;
        const originalData = this.modifiedCells.get(cellKey);
        if (originalData) {
            cell.textContent = originalData.originalValue;
            cell.classList.remove('modified-cell', 'invalid-input');
            this.hideValidationError(cell);
        }
    }

    showValidationError(cell, message) {
        let errorDiv = cell.querySelector('.validation-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error';
            cell.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    hideValidationError(cell) {
        const errorDiv = cell.querySelector('.validation-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    updateModificationHighlights() {
        // Toggle modification highlights on all modified cells
        this.modifiedCells.forEach((data, cellKey) => {
            if (data.isModified) {
                const [itemId, columnIndex] = cellKey.split('-');
                const rows = document.querySelectorAll(`#items-table tbody tr`);
                rows.forEach(row => {
                    const idCell = row.querySelector('td:first-child');
                    const typeCell = row.querySelector('td:nth-child(5)'); // Type column
                    
                    // Vérifier à la fois l'ID ET le type pour éviter les conflits
                    if (idCell && typeCell && 
                        idCell.textContent.trim() == itemId && 
                        typeCell.textContent.trim() === data.item.type) {
                        
                        const cell = row.querySelectorAll('td')[parseInt(columnIndex)];
                        if (cell) {
                            if (this.highlightModifications) {
                                cell.classList.add('modified-cell');
                            } else {
                                cell.classList.remove('modified-cell');
                            }
                        }
                    }
                });
            }
        });
    }

    addNewRow() {
        // Create a new item object
        const newItem = {
            id: this.nextNewId++,
            name: `New Item ${this.nextNewId - 1}`,
            type: 'object',
            rarity: 0,
            rawAttack: 0,
            rawDefense: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            finalAttack: 0,
            finalDefense: 0,
            finalSpeed: 0,
            nature: 0,
            power: 0,
            tags: []
        };

        // Add to the appropriate category in allItems - à la PREMIÈRE position
        if (window.app && window.app.allItems) {
            window.app.allItems.objects.unshift(newItem); // unshift au lieu de push
            
            // Refresh the display to show the new item
            window.app.updateDisplay();
            
            // Focus sur la première ligne (le nouvel item)
            setTimeout(() => {
                const table = document.getElementById('items-table');
                const newRow = table.querySelector(`tbody tr:first-child`); // first-child au lieu de last-child
                if (newRow) {
                    newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Focus on the name cell for immediate editing
                    const nameCell = newRow.querySelector('td:nth-child(3)');
                    if (nameCell) {
                        nameCell.focus();
                        // Select all text for easy replacement
                        const range = document.createRange();
                        range.selectNodeContents(nameCell);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }, 100);
        }
    }
}