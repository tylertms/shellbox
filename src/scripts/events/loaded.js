import toggleSidebar from '../menu/sidebar';
import populateShellData from '../menu/populate';
import { defaults, fileMap, categoryMap } from '../utils/constants';
import { setMenuStates } from '../menu/states'
import renderShells from '../render/render';

document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.querySelector('.toggle-button');
  const closeButton = document.querySelector('.close-button');

  toggleButton.addEventListener('click', toggleSidebar);
  closeButton.addEventListener('click', toggleSidebar);

  await populateShellData();

  const shells = defaults.max.map(building => {
    return { set: 'Default', building: building, name: fileMap[building], category: categoryMap[building] };
  });

  setMenuStates(shells);
  await renderShells(shells);
});