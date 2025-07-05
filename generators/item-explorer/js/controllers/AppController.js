// Main application controller
class AppController {
    constructor() {
        this.elements = new DOMElements();
        this.iconService = new IconService(this.elements); // Instance partagée
        this.itemLoader = new ItemLoader(this.elements, this.iconService);
        this.dataManager = new DataManager(this.elements);
        this.filterManager = new FilterManager(this.elements);
        this.statsManager = new StatsManager(this.elements);
        this.tableRenderer = new TableRenderer(this.elements, this.iconService);
        this.statAnalysis = new StatAnalysis(this.elements, this.iconService); // Nouveau composant d'analyse
        
        // Inject stat analysis into table renderer
        this.tableRenderer.setStatAnalysis(this.statAnalysis);
        
        this.allItems = { weapons: [], armors: [], objects: [], potions: [] };
        this.currentBranch = CONSTANTS.DEFAULT_BRANCH;
        this.currentType = 'all';
        this.filters = { search: '', rarities: [], nature: 'all' };
        this.sort = { column: 'id', direction: 'asc' };
        
        this.initializeEventListeners();
        this.initializeRarityFilter();
    }

    initializeRarityFilter() {
        // Initialize all rarities as selected by default
        this.filters.rarities = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
        this.updateRaritySelectionText();
    }

    initializeEventListeners() {
        // Load button
        this.elements.loadBtn.addEventListener('click', () => this.loadItems());
        
        // Save/Import buttons
        this.elements.saveBtn.addEventListener('click', () => this.saveData());
        this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.dataManager.importData(e, this));
        
        // Search input
        this.elements.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.updateDisplay();
        });
        
        // Rarity filter dropdown
        this.elements.rarityToggleBtn.addEventListener('click', () => {
            this.toggleRarityDropdown();
        });
        
        // Handle "All" checkbox
        this.elements.rarityAllCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectAllRarities();
            } else {
                this.deselectAllRarities();
            }
            this.updateRaritySelectionText();
            this.updateDisplay();
        });
        
        // Handle individual rarity checkboxes
        this.elements.rarityCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateRaritySelection();
                this.updateRaritySelectionText();
                this.updateDisplay();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.rarityToggleBtn.contains(e.target) && 
                !this.elements.rarityDropdown.contains(e.target)) {
                this.closeRarityDropdown();
            }
        });
        
        // Nature filter
        this.elements.natureFilter.addEventListener('change', (e) => {
            this.filters.nature = e.target.value;
            this.updateDisplay();
        });
        
        // Color coding toggle
        this.elements.colorCoding.addEventListener('change', () => {
            this.updateColorLegendVisibility();
            this.updateDisplay();
        });
        
        // Stat analysis is now always enabled - no checkbox to listen to
        
        // Type buttons
        this.elements.typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.typeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentType = e.target.dataset.type;
                this.filterManager.updateNatureFilterVisibility(this.currentType);
                this.updateDisplay();
            });
        });
        
        // Table sorting
        this.elements.tableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                if (this.sort.column === column) {
                    this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sort.column = column;
                    this.sort.direction = 'asc';
                }
                this.updateSortIndicators();
                this.updateDisplay();
            });
        });
    }

    async loadItems() {
        try {
            this.currentBranch = this.elements.branchSelect.value;
            this.allItems = await this.itemLoader.loadAllItems(this.currentBranch);
            this.elements.saveBtn.disabled = false;
            this.statsManager.updateStats(this.allItems);
            this.updateDisplay();
        } catch (error) {
            console.error('Error loading items:', error);
            alert(`Error loading items: ${error.message}`);
        }
    }

    saveData() {
        this.dataManager.saveData(this.allItems, this.currentBranch);
    }

    onDataImported(importedData) {
        this.allItems = importedData.items;
        this.currentBranch = importedData.branch;
        this.elements.branchSelect.value = this.currentBranch;
        this.elements.saveBtn.disabled = false;
        this.statsManager.updateStats(this.allItems);
        this.updateDisplay();
    }

    updateDisplay() {
        const useColorCoding = this.elements.colorCoding.checked;
        const useStatAnalysis = true; // Always enabled now
        this.tableRenderer.displayItems(this.allItems, this.currentType, this.filters, this.sort, useColorCoding, useStatAnalysis);
    }

    updateColorLegendVisibility() {
        this.elements.colorLegend.style.display = this.elements.colorCoding.checked ? 'block' : 'none';
    }

    updateSortIndicators() {
        this.elements.tableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.sort.column) {
                header.classList.add(`sort-${this.sort.direction}`);
            }
        });
    }

    // Rarity filter methods
    toggleRarityDropdown() {
        const isOpen = this.elements.rarityDropdown.classList.contains('show');
        if (isOpen) {
            this.closeRarityDropdown();
        } else {
            this.openRarityDropdown();
        }
    }

    openRarityDropdown() {
        this.elements.rarityDropdown.classList.add('show');
        this.elements.rarityToggleBtn.classList.add('open');
    }

    closeRarityDropdown() {
        this.elements.rarityDropdown.classList.remove('show');
        this.elements.rarityToggleBtn.classList.remove('open');
    }

    selectAllRarities() {
        this.filters.rarities = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
        this.elements.rarityCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    }

    deselectAllRarities() {
        this.filters.rarities = [];
        this.elements.rarityCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    updateRaritySelection() {
        this.filters.rarities = [];
        this.elements.rarityCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                this.filters.rarities.push(checkbox.dataset.rarity);
            }
        });

        // Update "All" checkbox state
        const allSelected = this.filters.rarities.length === this.elements.rarityCheckboxes.length;
        this.elements.rarityAllCheckbox.checked = allSelected;
    }

    updateRaritySelectionText() {
        const selectedCount = this.filters.rarities.length;
        const totalCount = this.elements.rarityCheckboxes.length;

        if (selectedCount === 0) {
            this.elements.raritySelectionText.textContent = 'None Selected';
        } else if (selectedCount === totalCount) {
            this.elements.raritySelectionText.textContent = 'All Selected';
        } else if (selectedCount === 1) {
            const rarityValue = this.filters.rarities[0];
            const rarityName = CONSTANTS.RARITY_NAMES[parseInt(rarityValue)] || `Rarity ${rarityValue}`;
            this.elements.raritySelectionText.textContent = rarityName;
        } else {
            this.elements.raritySelectionText.textContent = `${selectedCount} Selected`;
        }
    }
}