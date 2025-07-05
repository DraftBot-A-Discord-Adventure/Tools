// Data management service for save/import functionality
class DataManager {
    constructor(elements) {
        this.elements = elements;
    }

    saveData(allItems, currentBranch) {
        if (!allItems || Object.keys(allItems).length === 0) {
            alert('No data to save. Please load items first.');
            return;
        }

        const dataToSave = {
            branch: currentBranch,
            timestamp: new Date().toISOString(),
            items: allItems,
            version: '1.1'
        };

        const dataStr = JSON.stringify(dataToSave, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `crownicles-items-${currentBranch}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importData(event, appController) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate the imported data structure
                if (!importedData.items || !importedData.branch) {
                    throw new Error('Invalid file format. Missing required fields.');
                }

                if (!importedData.items.weapons || !importedData.items.armors || 
                    !importedData.items.objects || !importedData.items.potions) {
                    throw new Error('Invalid file format. Missing item types.');
                }

                // Call the app controller to handle the imported data
                appController.onDataImported(importedData);

                const versionInfo = importedData.version ? ` (v${importedData.version})` : '';
                const totalItems = importedData.items.weapons.length + 
                                 importedData.items.armors.length + 
                                 importedData.items.objects.length + 
                                 importedData.items.potions.length;

                alert(`Successfully imported ${totalItems} items from branch "${importedData.branch}"${versionInfo}\nImported on: ${importedData.timestamp}`);

            } catch (error) {
                console.error('Error importing data:', error);
                alert(`Failed to import data: ${error.message}`);
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    }
}