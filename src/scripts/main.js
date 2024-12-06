// scripts/main.js

import { getShells, initConfig, setShells } from './utils/config.js';
import populateShellData from './menu/populate.js';
import { setupPanelToggle, setupLowPerformance, setupCollapsible, setupApplyButtons, setupSigninButton } from './menu/panel.js'; // Import panel toggle
import { defaults, fileMap, categoryMap } from './utils/constants.js';
import loadShells from './render/load.js';
import { fetchBackup } from './api/backup.js';

// Function to initialize the application
async function initializeApp() {
  try {
    // Initialize configuration
    await initConfig();
    console.log('Configuration Loaded');

    setupPanelToggle();
    setupLowPerformance();
    setupCollapsible();
    setupApplyButtons();
    setupSigninButton();

    await populateShellData();

    // Set menu states based on shell data
    setShells(defaults.max.map((building, index) => ({
      setIdentifier: 'default',
      building: building,
      index: index - defaults.max.indexOf(building),
      name: fileMap[building],
      category: categoryMap[building]
    })));
    
    await loadShells();

    console.log('Application Initialized Successfully.');
  } catch (error) {
    console.error('Error during application initialization:', error);
  }
}

// Start the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);