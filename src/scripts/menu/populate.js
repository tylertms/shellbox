import dropdownChange from "../events/dropdown";
import { getConfig } from "../utils/config";

const panelContent = document.querySelector('.panel-content');
const dropdown = document.createElement('select');

async function populateShellData() {
  try {
    const header = document.createElement('h2');
    header.textContent = "SETS";
    panelContent.appendChild(header);

    const config = getConfig();
    config.shellSets.filter(s => !s.elementSet).sort((a, b) => a.name.localeCompare(b.name)).forEach(set => {
      console.log(set)
      const option = document.createElement('option');
      option.value = set.identifier;
      option.textContent = set.name;
      dropdown.appendChild(option);
    });
    
    panelContent.appendChild(dropdown);

    dropdown.addEventListener('change', dropdownChange);

    console.log("Successfully populated shell data.");
  } catch (error) {
    console.error("Failed to populate shell data:", error);
  }
}

export default populateShellData;
