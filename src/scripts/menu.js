import { populateShellData, loadShells } from './fetch.js';
import { defaults, fileMap, categoryMap } from './defaults.js';

const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  sidebar.classList.toggle('open');
}

export async function handleDropdownChange(event) {
  const states = getAllDropdownStates();
  await loadShells(states);
}

document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.querySelector('.toggle-button');
  const closeButton = document.querySelector('.close-button');

  toggleButton.addEventListener('click', toggleSidebar);
  closeButton.addEventListener('click', toggleSidebar);

  await populateShellData();

  const shells = defaults.max.map(building => {
    return { set: 'Default', building: building, name: fileMap[building], category: categoryMap[building] };
  });

  setDropdownStates(shells);
  await loadShells(shells);
});


function getAllDropdownStates() {
  // Get all dropdown menus
  const dropdownGroups = document.querySelectorAll('.dropdown-group');
  const states = [];

  dropdownGroups.forEach(group => {
    const categoryName = group.querySelector('label').value;
    const shellDropdown = group.querySelector('.shell-dropdown');
    const levelDropdown = group.querySelector('.level-dropdown');
    const setDropdown = group.querySelector('.set-dropdown');

    // Capture the selected values
    const shellValue = shellDropdown ? shellDropdown.options[shellDropdown.selectedIndex].text : null;
    const levelValue = levelDropdown ? levelDropdown.value : null;
    const setValue = setDropdown ? setDropdown.value : null;

    // Push the state for this group
    if (shellValue) {
      states.push({
        set: shellValue,
        building: categoryName,
        category: categoryName
      });
    } else {
      states.push({
        set: setValue,
        building: levelValue,
        category: categoryName
      });
    }
  });

  return states;
}

function setDropdownStates(shells) {
  const dropdownGroups = document.querySelectorAll('.dropdown-group');
  dropdownGroups.forEach(group => {
    const categoryName = group.querySelector('label').value;
    const shellDropdown = group.querySelector('.shell-dropdown');
    const levelDropdown = group.querySelector('.level-dropdown');
    const setDropdown = group.querySelector('.set-dropdown');
    const state = shells.find(state => state.category === categoryName);

    if (state) {
      if (shellDropdown) shellDropdown.value = state.category;
      if (levelDropdown) levelDropdown.value = state.building;
      if (setDropdown) setDropdown.value = state.set;
    }
  });
}