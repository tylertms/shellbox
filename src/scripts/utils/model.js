import * as THREE from "three";
import { categoryMap, dependentBuildings } from "./constants";
import { scene } from "../render/scene";

const getSize = (model) => {
  try {
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    return size;
  } catch (error) {
    console.error("Failed to get model size:", error);
    return new THREE.Vector3(0, 0, 0);
  }
}

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

export { getSize, applyProperties, adjustPositions, handleDependencies };