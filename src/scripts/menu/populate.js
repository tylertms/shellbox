import { getBackup } from "../api/backup";
import { getConfig } from "../utils/config";
import { orderedBuildings, categoryMap } from "../utils/constants";


const setDropdown = document.getElementById('set-select')
const decoratorDropdown = document.getElementById('decorator-select')
const configDropdown = document.getElementById('config-select')

async function populateShellData() {
  try {
    const config = getConfig();
    const backup = getBackup();

    const defaultOption = document.createElement('option');
    defaultOption.value = 'default';
    defaultOption.textContent = 'Default';

    if (!setDropdown.childElementCount)
    setDropdown.appendChild(defaultOption);

    const noneOption = document.createElement('option');
    noneOption.value = 'sd_default';
    noneOption.textContent = 'None';
    if (!decoratorDropdown.childElementCount)
    decoratorDropdown.appendChild(noneOption);

    if (setDropdown.childElementCount === 1)
    config.shellSets.filter(s => !s.elementSet).sort((a, b) => a.name.localeCompare(b.name)).forEach(set => {
      const option = document.createElement('option');
      option.value = set.identifier;
      option.textContent = set.name;
      setDropdown.appendChild(option);
    });

    if (decoratorDropdown.childElementCount === 1)
    config.decorators.sort((a, b) => a.name.localeCompare(b.name)).forEach(decorator => {
      const option = document.createElement('option');
      option.value = decorator.identifier;
      option.textContent = decorator.name;
      decoratorDropdown.appendChild(option);
    })
    
    configDropdown.innerHTML = ''
    if (backup?.shellDb)
    backup.shellDb.savedConfigsList.forEach(config => {
      const option = document.createElement('option');
      option.value = config.id;
      option.textContent = config.id;
      configDropdown.appendChild(option);
    })

    console.log("Successfully populated shell data.");
  } catch (error) {
    console.error("Failed to populate shell data:", error);
  }
}

export default populateShellData;
