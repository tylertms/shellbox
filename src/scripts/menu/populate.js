import fetchShellConfig from "../utils/config";
import { displayNames } from "../utils/constants";
import dropdownChange from "../events/dropdown";
const dropdownContainer = document.getElementById('dropdown-container');

var categories = {
  'HAB': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'SILO': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'HATCHERY': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'MISSION_CONTROL': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'SHIPPING_DEPOT': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'FUEL_TANK': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'HOA': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'LAB': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'MAILBOX': { shells: [], levels: new Set(), sets: new Set(['Default']) },
  'HARDSCAPE': { shells: [] },
  'GROUND': { shells: [] },
  'HYPERLOOP_STOP': { shells: [] },
  'HYPERLOOP_TRACK': { shells: [] },
  'TROPHY_CASE': { shells: [] }
};

async function populateShellData() {
  try {
    // Fetch the shells data
    const shells = await fetchShellConfig();

    // Categorize each shell
    shells.forEach(shell => {
      const { name, building, set } = shell;

      if (name.startsWith('ei_hab')) {
        categories['HAB'].shells.push(shell);
        categories['HAB'].levels.add(building);
        categories['HAB'].sets.add(set);
      } else if (name.startsWith('ei_silo')) {
        categories['SILO'].shells.push(shell);
        categories['SILO'].levels.add(building);
        categories['SILO'].sets.add(set);
      } else if (name.startsWith('ei_hatchery')) {
        categories['HATCHERY'].shells.push(shell);
        categories['HATCHERY'].levels.add(building);
        categories['HATCHERY'].sets.add(set);
      } else if (name.startsWith('ei_mission_control')) {
        categories['MISSION_CONTROL'].shells.push(shell);
        categories['MISSION_CONTROL'].levels.add(building);
        categories['MISSION_CONTROL'].sets.add(set);
      } else if (name.startsWith('ei_depot')) {
        categories['SHIPPING_DEPOT'].shells.push(shell);
        categories['SHIPPING_DEPOT'].levels.add(building);
        categories['SHIPPING_DEPOT'].sets.add(set);
      } else if (name.startsWith('ei_farm_hardscape')) {
        categories['HARDSCAPE'].shells.push(shell);
      } else if (name.startsWith('ei_farm')) {
        categories['GROUND'].shells.push(shell);
      } else if (name.startsWith('ei_fuel_tank')) {
        categories['FUEL_TANK'].shells.push(shell);
        categories['FUEL_TANK'].levels.add(building);
        categories['FUEL_TANK'].sets.add(set);
      } else if (name.startsWith('ei_hoa')) {
        categories['HOA'].shells.push(shell);
        categories['HOA'].levels.add(building);
        categories['HOA'].sets.add(set);
      } else if (name.startsWith('ei_hyperloop_stop')) {
        categories['HYPERLOOP_STOP'].shells.push(shell);
      } else if (name.startsWith('ei_hyperloop_track')) {
        categories['HYPERLOOP_TRACK'].shells.push(shell);
      } else if (name.startsWith('ei_lab')) {
        categories['LAB'].shells.push(shell);
        categories['LAB'].levels.add(building);
        categories['LAB'].sets.add(set);
      } else if (building === 'MAILBOX') {
        categories['MAILBOX'].shells.push(shell);
        categories['MAILBOX'].levels.add(building);
        categories['MAILBOX'].sets.add(set);
      } else if (name.startsWith('ei_trophy_case')) {
        categories['TROPHY_CASE'].shells.push(shell);
      }
    });

    dropdownContainer.innerHTML = '';

    // Function to create a select element with options
    const createSelect = (className, value, placeholder, selectedValue = null) => {
      const select = document.createElement('select');
      select.className = className;
      const defaultOption = document.createElement('option');
      defaultOption.value = value;
      defaultOption.textContent = placeholder;
      select.appendChild(defaultOption);

      return select;
    };

    // Generate dropdowns for each category
    Object.keys(categories).forEach(categoryName => {
      const category = categories[categoryName];
      const { shells, levels, sets } = category;

      // Skip categories with no shells
      if (!shells || shells.length === 0) return;

      const group = document.createElement('div');
      group.className = 'dropdown-group';

      // Create and append the label
      const label = document.createElement('label');
      label.value = categoryName;
      label.textContent = displayNames[categoryName];
      group.appendChild(label);

      // Determine if the category has levels and sets
      const hasLevelsAndSets = levels && levels.size > 1 && sets && sets.size > 1;

      if (hasLevelsAndSets) {
        // Create Level dropdown
        const levelSelect = createSelect('level-dropdown', categoryName, '--Select Level--');
        Array.from(levels).sort().forEach(level => {
          const option = document.createElement('option');
          option.value = level;
          option.textContent = level;
          levelSelect.appendChild(option);
        });

        levelSelect.dataset.category = categoryName;
        levelSelect.addEventListener('change', dropdownChange);
        
        group.appendChild(levelSelect);

        // Create Set dropdown
        const setSelect = createSelect('set-dropdown', categoryName, 'Default');
        Array.from(sets).sort().forEach(set => {
          const option = document.createElement('option');
          option.value = set;
          option.textContent = set;
          setSelect.appendChild(option);
        });

        setSelect.dataset.category = categoryName;
        setSelect.addEventListener('change', dropdownChange);

        group.appendChild(setSelect);

      } else {
        // Create Shells dropdown
        const shellSelect = createSelect('shell-dropdown', categoryName, 'Default');
        shells.sort((a, b) => a.set.localeCompare(b.set)).forEach(shell => {
          const option = document.createElement('option');
          option.value = shell.set;
          option.textContent = shell.set;
          option.dataset.shell = JSON.stringify(shell);
          shellSelect.appendChild(option);
        });

        shellSelect.dataset.category = categoryName;
        shellSelect.addEventListener('change', dropdownChange);

        group.appendChild(shellSelect);
      }

      // Append the group to the container
      dropdownContainer.appendChild(group);
    });

    console.log("Successfully populated shell data.");
  } catch (error) {
    console.error("Failed to populate shell data:", error);
  }
}

export default populateShellData;
export { categories };
