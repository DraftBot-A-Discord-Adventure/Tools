// Item loading service
class ItemLoader {
    constructor(elements) {
        this.elements = elements;
        this.iconService = new IconService(elements);
        this.itemCalculator = new ItemCalculator();
        this.remainingApiCalls = CONSTANTS.GITHUB_API_LIMIT;
    }

    async loadAllItems(branch) {
        this.elements.loadingIndicator.style.display = 'block';
        this.elements.loadBtn.disabled = true;
        this.elements.progressBar.style.width = '0%';

        const allItems = {
            weapons: [],
            armors: [],
            objects: [],
            potions: []
        };

        try {
            // Load item names and icons first
            await this.loadItemNames(branch);
            await this.iconService.loadCrowniclesIcons(branch);

            // Load all item types
            for (let i = 0; i < CONSTANTS.ITEM_TYPES.length; i++) {
                const { type, count } = CONSTANTS.ITEM_TYPES[i];
                
                this.elements.loadingStatus.textContent = `Loading ${type} directory...`;
                
                const items = await this.loadItemType(branch, type);
                allItems[type] = items;

                const overallProgress = ((i + 1) / CONSTANTS.ITEM_TYPES.length) * 100;
                this.elements.progressBar.style.width = `${overallProgress}%`;
            }

            this.elements.loadingStatus.textContent = 'All items loaded successfully!';
            setTimeout(() => {
                this.elements.loadingIndicator.style.display = 'none';
            }, 1000);

            return allItems;

        } catch (error) {
            this.elements.loadingStatus.textContent = `Error: ${error.message}`;
            throw error;
        } finally {
            this.elements.loadBtn.disabled = false;
        }
    }

    async loadItemType(branch, type) {
        const dirResponse = await fetch(
            `https://api.github.com/repos/Crownicles/Crownicles/contents/Core/resources/${type}?ref=${branch}`
        );
        this.updateApiRateLimit(dirResponse);

        if (!dirResponse.ok) {
            throw new Error(`Failed to fetch ${type} directory: ${dirResponse.status}`);
        }

        const files = await dirResponse.json();
        files.sort((a, b) => {
            const numA = parseInt(a.name.split('.')[0]);
            const numB = parseInt(b.name.split('.')[0]);
            return numA - numB;
        });

        const items = [];
        const batches = Math.ceil(files.length / CONSTANTS.BATCH_SIZE);

        for (let j = 0; j < batches; j++) {
            const batchFiles = files.slice(j * CONSTANTS.BATCH_SIZE, (j + 1) * CONSTANTS.BATCH_SIZE);
            
            const batchPromises = batchFiles.map(file => {
                return fetch(file.download_url)
                    .then(res => res.json())
                    .then(item => {
                        const id = parseInt(file.name.split('.')[0]);
                        item.id = id;
                        item.type = type.slice(0, -1);
                        
                        // Get name from i18n or generate default
                        const i18nName = this.itemNames && this.itemNames[type] && this.itemNames[type][id.toString()];
                        if (i18nName) {
                            item.name = i18nName;
                        } else {
                            const typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);
                            item.name = `${typeName} ${id}`;
                        }
                        
                        // Calculate final stats
                        this.itemCalculator.calculateStats(item, type);
                        
                        return item;
                    })
                    .catch(err => {
                        console.warn(`Failed to load ${type} item ${file.name}:`, err);
                        return null;
                    });
            });

            const batchResults = await Promise.all(batchPromises);
            batchResults.filter(item => item !== null).forEach(item => {
                items.push(item);
            });

            this.elements.loadingStatus.textContent = `Loading ${type}: ${items.length} items (batch ${j+1}/${batches})`;
        }

        return items;
    }

    async loadItemNames(branch) {
        try {
            this.elements.loadingStatus.textContent = 'Loading item names from i18n...';
            
            const response = await fetch(`https://raw.githubusercontent.com/Crownicles/Crownicles/${branch}/Lang/fr/models.json`);
            this.updateApiRateLimit(response);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch i18n file: ${response.status}`);
            }
            
            const i18nData = await response.json();
            
            this.itemNames = {
                weapons: i18nData.weapons || {},
                armors: i18nData.armors || {},
                objects: i18nData.objects || {},
                potions: i18nData.potions || {}
            };
            
            console.log('Loaded item names:', {
                weapons: Object.keys(this.itemNames.weapons).length,
                armors: Object.keys(this.itemNames.armors).length,
                objects: Object.keys(this.itemNames.objects).length,
                potions: Object.keys(this.itemNames.potions).length
            });
            
        } catch (error) {
            console.warn('Failed to load item names from i18n:', error);
        }
    }

    updateApiRateLimit(response) {
        if (response.headers.has('X-RateLimit-Remaining')) {
            this.remainingApiCalls = parseInt(response.headers.get('X-RateLimit-Remaining'));
            
            this.elements.apiStatus.textContent = `GitHub API calls remaining: ${this.remainingApiCalls}`;
            
            if (this.remainingApiCalls < 100) {
                this.elements.apiStatus.classList.add('warning');
            } else {
                this.elements.apiStatus.classList.remove('warning');
            }
        }
    }
}