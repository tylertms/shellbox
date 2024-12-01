function getMenuStates() {
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

function setMenuStates(shells) {
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

export { getMenuStates, setMenuStates };