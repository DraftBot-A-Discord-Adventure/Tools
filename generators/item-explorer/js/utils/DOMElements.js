// DOM Elements manager - centralize all DOM element references
class DOMElements {
    constructor() {
        // Controls
        this.branchSelect = document.getElementById('branch-select');
        this.loadBtn = document.getElementById('load-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.importBtn = document.getElementById('import-btn');
        this.importFile = document.getElementById('import-file');
        
        // Filters and search
        this.searchInput = document.getElementById('search');
        this.rarityFilter = document.getElementById('rarity-filter');
        this.natureFilter = document.getElementById('nature-filter');
        this.natureFilterContainer = document.getElementById('nature-filter-container');
        this.colorCoding = document.getElementById('color-coding');
        this.colorLegend = document.getElementById('color-legend');
        
        // Type buttons
        this.typeButtons = document.querySelectorAll('.type-btn');
        
        // Table
        this.itemsTable = document.getElementById('items-table');
        this.tableBody = this.itemsTable.querySelector('tbody');
        this.tableHeaders = this.itemsTable.querySelectorAll('th[data-sort]');
        
        // Loading
        this.loadingIndicator = document.getElementById('loading');
        this.loadingStatus = document.getElementById('loading-status');
        this.progressBar = document.getElementById('progress');
        this.apiStatus = document.getElementById('api-status');
        
        // Stats
        this.weaponsCount = document.getElementById('weapons-count');
        this.armorsCount = document.getElementById('armors-count');
        this.objectsCount = document.getElementById('objects-count');
        this.potionsCount = document.getElementById('potions-count');
        this.totalCount = document.getElementById('total-count');
        this.rarityStats = document.getElementById('rarity-stats');
    }
}