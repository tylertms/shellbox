import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { scene } from './scene.js';
import { convertBuffer } from './convert.js';
import { dependentBuildings, categoryMap, displayNames } from './defaults.js';
import { handleDropdownChange } from './menu.js';
import { fileMap } from './defaults';

// URLs
const URLs = {
  shells: 'https://gist.githubusercontent.com/tylertms/7592bcbdd1b6891bdf9b2d1a4216b55b/raw',
  worker: 'https://shell.tylertms.workers.dev/?url=https://auxbrain.com/dlc/shells/',
  r2: 'https://pub-09894c58859248c6ba3cd24f4045b4b5.r2.dev/',
};

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


// Initialize GLTF loader
const loader = new GLTFLoader();

// Utility function to get the size of a model
const getSize = (model) => {
  try {
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    return size;
  } catch (error) {
    console.error("Failed to get model size:", error);
    return new THREE.Vector3(0, 0, 0);
  }
}


export async function loadShells(shells) {
  // Clear the scene
  scene.children = scene.children.filter((child) => child.userData.permanent == true);
  await Promise.all(shells.map(async (shell) => {
    console.log("Loading shell:", shell);
    let uri;
    if (shell.set === 'Default') {
      if (!shell.name) {
        shell.name = fileMap[shell.building];
        if (!shell.name) return;
      }

      const glb = await fetch(`${URLs.r2}${shell.name}.glb`);
      const buffer = await glb.arrayBuffer();
      uri = URL.createObjectURL(new Blob([buffer]));
    } else {

      if (!shell.name) {
        let matchingShell = categories[shell.category].shells.find((s) => s.set === shell.set && s.building === shell.building);
        if (!matchingShell) return;
        shell.name = matchingShell.name;
        shell.id = matchingShell.id;
      } 


      const rpoz = await fetch(`${URLs.worker}${shell.name}${shell.id && shell.id.length ? '_' + shell.id : ''}.rpoz`);
      const buffer = await rpoz.arrayBuffer();
      const decompressed = pako.inflate(new Uint8Array(buffer));
      const glb = convertBuffer(decompressed, shell.name);
      uri = URL.createObjectURL(new Blob([glb]));
    }

    loader.load(uri, (gltf) => {
      const model = gltf.scene;

      scene.add(model);

      applyProperties(model, shell);
      handleDependencies(shell.building);
    });
  }));
};

const applyProperties = (model, shell) => {
  model.userData = {
    building: shell.building,
    set: shell.set,
    category: shell.category || categoryMap[shell.building],
    name: shell.name,
    id: shell.id
  };

  const { positions, rotations } = adjustPositions(shell, model);

  if (positions) model.position.set(positions.x, positions.y, positions.z);
  if (rotations) model.rotation.set(rotations.x, rotations.y, rotations.z);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.metalness = 0;
      child.material.roughness = 1;
    }
  });
};

// Fetch and parse shells
export async function fetchShells() {
  const response = await fetch(URLs.shells);
  const data = await response.text();

  return data.split('\n').reduce((shells, row) => {
    const columns = row.split('|');
    if (columns.length >= 5 && columns[0] === 'shell') {
      const [type, set, building, name, id, size] = [
        columns[0],
        ...columns[1].split(' - '),
        columns[2],
        columns[3],
        columns[4],
      ];
      shells.push({ type, set, building, name, id, size });
    }
    return shells;
  }, []);
};




const adjustPositions = (shell, model, index = 0) => {
  const { building } = shell;
  let positions = { x: 0, y: 0, z: 0 };
  let rotations = { x: 0, y: 0, z: 0 };

  if (building.startsWith('HATCHERY_DARK_MATTER_RING')) {
    const lastChar = building.slice(-1);
    switch (lastChar) {
      case '1':
        rotations = { x: Math.PI / 4, y: Math.PI / 3, z: Math.PI / 4 };
        break;
      case '2':
        rotations.x = Math.PI / 2.1;
        break;
      case '3':
        rotations.x = -Math.PI / 6;
        break;
    }
    positions = { x: 13.75, y: 4.25, z: 3 };
  } else if (building.startsWith('HATCHERY_ENLIGHTENMENT_ORB')) {
    positions = { x: 10, y: 2, z: 3 };
  } else if (building.startsWith('HATCHERY_NEBULA_')) {
    const type = building.split('_')[2][0];
    positions = type === 'T' ? { x: 11.325, y: 3.45, z: 3 } : { x: 11.325, y: 2.15, z: 3 };
  } else if (building.startsWith('HATCHERY_UNIVERSE_')) {
    positions = { x: 10, y: 2, z: 3 };
  } else if (building.startsWith('SILO')) {
    const silos = scene.children.filter((child) => child.userData.building?.startsWith('SILO'));

    positions = {
      x: -6 * (silos.length % 5) - 5,
      y: 0,
      z: -6 * (silos.length % 2) + 5.5,
    };
  } else if (building.startsWith('HOA')) {
    const lab = scene.children.find((child) => child.userData.building?.startsWith('LAB'));
    positions = {
      x: lab ? getSize(lab).x + 5 : 0,
      y: 0,
      z: -3,
    };
  } else if (building.startsWith('MISSION_CONTROL')) {
    const hatchery = scene.children.find((child) =>
      child.userData.building?.startsWith('HATCHERY')
    );
    const depot = scene.children.find((child) =>
      child.userData.building?.startsWith('DEPOT')
    );

    const max = Math.max(hatchery ? getSize(hatchery).x : 0, depot ? getSize(depot).x : 0);
    positions = { x: max + 11, y: 0, z: 6 };
  } else if (building.startsWith('FUEL_TANK')) {
    const missionControl = scene.children.find((child) =>
      child.userData.building?.startsWith('MISSION_CONTROL')
    );
    positions = {
      x: missionControl ? missionControl.position.x + getSize(missionControl).x / 2 + 3 : 0,
      y: 0,
      z: 3.5,
    };
  } else if (building.startsWith('TROPHY_CASE')) {
    positions = { x: -5.5, y: 0, z: 11.5 };
  }

  if (categoryMap[building] === 'HAB') {
    const allHabs = scene.children.filter((child) => {
      if (!child.userData || !child.userData.building) return false;
      return categoryMap[child.userData.building] === 'HAB';
    });

    const totalX = allHabs.reduce(
      (acc, hab) => (hab !== model ? acc + getSize(hab).x + 2.5 : acc),
      -19.5
    );
    positions = { x: totalX + getSize(model).x / 2, y: 0, z: -10.5 };
  }

  return { positions, rotations };
};

const handleDependencies = (shellOrBuilding) => {
  Object.keys(dependentBuildings).forEach((key) => {
    if (shellOrBuilding.startsWith(key)) {
      const dependentModel = scene.children.find((child) =>
        child.userData.building?.startsWith(dependentBuildings[key])
      );
      if (dependentModel) {
        const dependentShell = { building: dependentModel.userData.building };
        const { positions } = adjustPositions(dependentShell);
        if (positions) {
          dependentModel.position.set(positions.x, positions.y, positions.z);
        }
      }
    }
  });
};

export async function populateShellData() {
  try {
    // Fetch the shells data
    const shells = await fetchShells();

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
        levelSelect.addEventListener('change', handleDropdownChange);
        
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
        setSelect.addEventListener('change', handleDropdownChange);

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
        shellSelect.addEventListener('change', handleDropdownChange);

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