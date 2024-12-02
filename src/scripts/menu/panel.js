// scripts/menu/panelToggle.js
import applyPerformanceMode from "../render/scene";

export function setupPanelToggle() {
  const toggleButton = document.querySelector('.side-panel .toggle-button');
  const panelContent = document.querySelector('.side-panel .panel-content');

  toggleButton.addEventListener('click', () => {
      panelContent.classList.toggle('open');
  });
}

export function setupLowPerformance() {
  const lowPerformanceButton = document.querySelector('.side-panel .performance-mode-toggle');
  console.log('Low Performance Button:', lowPerformanceButton)
  lowPerformanceButton.addEventListener('click', () => {
    const performanceModeCheckbox = document.querySelector('#performance-mode');
    const isChecked = performanceModeCheckbox.checked;
    applyPerformanceMode(isChecked);
  });
}
