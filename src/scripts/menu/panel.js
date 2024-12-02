import applyPerformanceMode from "../render/scene";
import { getConfig } from "../utils/config";
import { defaults, fileMap, categoryMap } from "../utils/constants";
import renderShells from "../render/render";

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

export function setupCollapsible() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}

export function setupApplyButtons() {
  const buttons = document.getElementsByClassName("apply");
  const selector = document.getElementById("set-select");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", async function() {
      const selectedValue = selector.value;
      console.log('Selected Value:', selectedValue);
      await applySet(selectedValue)
    })
  }
}

async function applySet(set) {
  const config = getConfig();
  const shells = defaults.max.map(building => {
    if (building === "HYPERLOOP_TRACK") return;
    if (building === "HYPERLOOP_STOP") building = "HYPERLOOP";
    
    return config.shells.find(shell => shell.setIdentifier === set && shell.primaryPiece.assetType === building)
      || {
      set: 'Default',
      building: building,
      name: fileMap[building],
      category: categoryMap[building]
    };
  }).filter(shell => shell !== undefined);

  await renderShells(shells);
}