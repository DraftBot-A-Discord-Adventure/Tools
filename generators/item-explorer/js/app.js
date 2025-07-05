// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    console.log('Crownicles Item Explorer v1.1 - Starting application...');
    
    try {
        // Initialize the application
        const app = new AppController();
        console.log('Application initialized successfully');
        
        // Make app globally available for debugging
        window.crowniclesApp = app;
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.textContent = `Error initializing application: ${error.message}`;
        document.body.appendChild(errorDiv);
        
        // Auto-remove error after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }
});