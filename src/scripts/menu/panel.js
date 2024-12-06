import { fetchBackup } from "../api/backup";
import applyPerformanceMode from "../render/scene";
import { apply } from "../utils/apply";
import populateShellData from "./populate";

export function setupPanelToggle() {
  const toggleButton = document.querySelector('.side-panel .toggle-button');
  const panelContent = document.querySelector('.side-panel .panel-content');

  toggleButton.addEventListener('click', () => {
    panelContent.classList.toggle('open');
  });
}

export function setupLowPerformance() {
  const lowPerformanceButton = document.querySelector('.side-panel .performance-mode-toggle');
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
      if (content.style.display === "flex") {
        content.style.display = "none";
      } else {
        content.style.display = "flex";
      }
    });
  }
}

export function setupApplyButtons() {
  const buttons = document.getElementsByClassName("apply");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", async function() {
      const selectedValue = buttons[i].previousElementSibling.value
      await apply(selectedValue, buttons[i].previousElementSibling?.id)
    })
  }
}

export function setupSigninButton() {
  const button = document.getElementById("submit-eid");
  const textbox = document.getElementById("eid-text");

  const submitEID = async () => {
    if (button.classList.contains("disabled")) return;
    
    button.classList.add("disabled");

    let result = await fetchBackup(textbox.value)
    alert(result.message)
    if (result.success) {
      textbox.value = '';
      populateShellData();
    }

    button.classList.remove("disabled");
  }

  button.addEventListener('click', submitEID);
  textbox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      button.click();
    }
  });
}