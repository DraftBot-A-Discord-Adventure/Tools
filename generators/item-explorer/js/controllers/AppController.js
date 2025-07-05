// Main application controller
class AppController {
    constructor() {
        this.elements = new DOMElements();
        this.iconService = new IconService(this.elements); // Instance partagée
        this.itemLoader = new ItemLoader(this.elements, this.iconService);
        this.dataManager = new DataManager(this.elements);
        this.filterManager = new FilterManager(this.elements);
        this.statsManager = new StatsManager(this.elements);
        this.tableRenderer = new TableRenderer(this.elements, this.iconService); // Passer l'instance partagée
        
        this.allItems = { weapons: [], armors: [], objects: [], potions: [] };
        this.currentBranch = CONSTANTS.DEFAULT_BRANCH;
        this.currentType = 'all';
        this.filters = { search: '', rarity: 'all', nature: 'all' };
        this.sort = { column: 'id', direction: 'asc' };
        
        this.initializeEventListeners();
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
        
        // Filter dropdowns
        this.elements.rarityFilter.addEventListener('change', (e) => {
            this.filters.rarity = e.target.value;
            this.updateDisplay();
        });
        
        this.elements.natureFilter.addEventListener('change', (e) => {
            this.filters.nature = e.target.value;
            this.updateDisplay();
        });
        
        // Color coding toggle
        this.elements.colorCoding.addEventListener('change', () => {
            this.updateColorLegendVisibility();
            this.updateDisplay();
        });
        
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
        this.tableRenderer.displayItems(this.allItems, this.currentType, this.filters, this.sort, useColorCoding);
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
}