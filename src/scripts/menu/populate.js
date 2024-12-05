import { getConfig } from "../utils/config";
import { orderedBuildings, categoryMap } from "../utils/constants";


const setDropdown = document.getElementById('set-select')
const decoratorDropdown = document.getElementById('decorator-select')

async function populateShellData() {
  try {
    const config = getConfig();

    const defaultOption = document.createElement('option');
    defaultOption.value = 'default';
    defaultOption.textContent = 'Default';

    setDropdown.appendChild(defaultOption);

    const noneOption = document.createElement('option');
    noneOption.value = 'sd_default';
    noneOption.textContent = 'None';
    decoratorDropdown.appendChild(noneOption);

    config.shellSets.filter(s => !s.elementSet).sort((a, b) => a.name.localeCompare(b.name)).forEach(set => {
      const option = document.createElement('option');
      option.value = set.identifier;
      option.textContent = set.name;
      setDropdown.appendChild(option);
    });

    config.decorators.sort((a, b) => a.name.localeCompare(b.name)).forEach(decorator => {
      const option = document.createElement('option');
      option.value = decorator.identifier;
      option.textContent = decorator.name;
      decoratorDropdown.appendChild(option);
    })
    


    console.log("Successfully populated shell data.");
  } catch (error) {
    console.error("Failed to populate shell data:", error);
  }
}

export default populateShellData;
