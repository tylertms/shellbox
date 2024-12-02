// scripts/main.js

import { initConfig } from './utils/config.js';
import populateShellData from './menu/populate.js';
import renderShells from './render/render.js';
import { setupPanelToggle, setupLowPerformance } from './menu/panel.js'; // Import panel toggle
import { defaults, fileMap, categoryMap } from './utils/constants.js';

// Function to initialize the application
async function initializeApp() {
  try {
    // Initialize configuration
    const config = await initConfig();
    console.log('Configuration Loaded:', config);

    setupPanelToggle();
    setupLowPerformance();

    await populateShellData();

    // Set menu states based on shell data
    const shells = defaults.max.map(building => ({
      set: 'Default',
      building: building,
      name: fileMap[building],
      category: categoryMap[building]
    }));
    
    await renderShells(shells);

    console.log('Application Initialized Successfully.');
  } catch (error) {
    console.error('Error during application initialization:', error);
  }
}

// Start the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);