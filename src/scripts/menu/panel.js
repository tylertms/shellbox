import applyPerformanceMode from "../render/scene";
import { applySet } from "../utils/apply";

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
  const setSelector = document.getElementById("set-select");

  for (let i = 0; i < buttons.length; i++) {
    console.log("BUTTON " + i)
    buttons[i].addEventListener("click", async function() {
      const selectedValue = buttons[i].previousElementSibling.value

      await applySet(selectedValue)
    })
  }
}