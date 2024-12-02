import { scene } from './scene';
import { URLs, fileMap } from '../utils/constants';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { applyProperties, handleDependencies } from '../utils/model';
import convertBuffer from '../utils/convert';
import pako from 'pako';

const loader = new GLTFLoader();

async function renderShells(shells) {
  scene.children = scene.children.filter((child) => child.userData.permanent == true);

  shells.forEach(shell => {
    if (!shell.pieces?.length) return;
    shell.pieces.forEach(piece => {
      const newShell = { ...shell, primaryPiece: piece };
      shells.push(newShell);
    });
  });

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
      const rpoz = await fetch(`${URLs.worker}?url=${shell.primaryPiece.dlc.url}`);
      const buffer = await rpoz.arrayBuffer();
      const decompressed = pako.inflate(new Uint8Array(buffer));
      const glb = convertBuffer(decompressed, shell.name);
      uri = URL.createObjectURL(new Blob([glb]));
    }

    loader.load(uri, (gltf) => {
      const model = gltf.scene;

      scene.add(model);

      applyProperties(model, shell);
      handleDependencies(shell);
    });
  }));
};

export default renderShells;