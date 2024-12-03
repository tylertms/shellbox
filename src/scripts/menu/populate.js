import { getConfig } from "../utils/config";
import { orderedBuildings, categoryMap } from "../utils/constants";

const setContent = document.getElementById('sets');
const buildingContent = document.querySelector('.buildings');
const dropdown = document.getElementById('set-select')

async function populateShellData() {
  try {
    const config = getConfig();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Default';
    dropdown.appendChild(defaultOption);
    config.shellSets.filter(s => !s.elementSet).sort((a, b) => a.name.localeCompare(b.name)).forEach(set => {
      const option = document.createElement('option');
      option.value = set.identifier;
      option.textContent = set.name;
      dropdown.appendChild(option);
    });
    
    setContent.appendChild(dropdown);

    dropdown.addEventListener('change', dropdownChange);

    console.log("Successfully populated shell data.");
  } catch (error) {
    console.error("Failed to populate shell data:", error);
  }
}

export default populateShellData;
