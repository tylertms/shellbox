import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';
import { URLs, fileMap } from "../utils/constants";
import { scene } from "./scene";
import convertBuffer from "../utils/convert";
import { applyProperties, getRandomizedAltAsset, handleDependencies } from "../utils/model";
import { getShells, getDecorator, getConfig } from "../utils/config";
import pako from "pako";

const loader = new GLTFLoader();

const loadGltf = (uri) => {
  return new Promise((resolve, reject) => {
    loader.load(
      uri,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
};


const getUri = async (shell) => {
  try {
    if (!shell.identifier && !shell.dlc) {
      
      shell.name = shell.name || fileMap[shell.building];
      if (!shell.name) return null;

      const response = await fetch(`${URLs.r2}${shell.name}.glb`);
      if (!response.ok) throw new Error(`Failed to fetch ${shell.name}.glb`);
      const buffer = await response.arrayBuffer();
      return URL.createObjectURL(new Blob([buffer]));
    } else {
      
      let url = shell.dlc?.url || shell.primaryPiece?.dlc?.url
      if (!url) return null;

      const response = await fetch(`${URLs.worker}?url=${url}`);
      if (!response.ok) throw new Error(`Failed to fetch DLC from ${url}`);
      const buffer = await response.arrayBuffer();
      const decompressed = pako.inflate(new Uint8Array(buffer));
      const glb = convertBuffer(decompressed, shell.name);
      return URL.createObjectURL(new Blob([glb]));
    }
  } catch (error) {
    console.error(`Error generating URI for shell "${shell.name}":`, error);
    return null;
  }
};


const processModel = async (shell) => {
  const uri = await getUri(shell);
  if (!uri) return null;
  try {
    var model = await loadGltf(uri);
    if (shell.hexBaseColor && shell.variation) {
      model = applyColor(model, shell.hexBaseColor, shell.variation.hexColor)
    }

    URL.revokeObjectURL(uri); 
    return model;
  } catch (error) {
    console.error(`Failed to load model for shell "${shell.name}":`, error);
    URL.revokeObjectURL(uri);
    return null;
  }
};

function clearShells() {
  scene.children = scene.children.filter(c => c.userData.permanent == true)
}


export default async function loadShells() {
  const shells = getShells();

  clearShells();
  await Promise.all(
    shells.map(async (shell) => {
      let decorator = shell.decorator || getDecorator();
      const mainModel = await processModel(shell);
      if (!mainModel) return;

      const loadTasks = [];

      if (decorator && !shell.modifiedGeometry) {
        let decoratedShell = getConfig().shells.find(
          (d) =>
            d.setIdentifier === decorator.identifier &&
            (shell.primaryPiece?.assetType || shell.building).startsWith(d.primaryPiece.assetType)
        );

        if (decoratedShell) {
          decoratedShell = getRandomizedAltAsset(decoratedShell)
          loadTasks.push(
            processModel(decoratedShell).then((decoratorModel) => {
              if (decoratorModel) {
                mainModel.add(decoratorModel);
              }
            })
          );
        }
      }
      
      if (Array.isArray(shell.pieces) && shell.pieces.length > 0) {
        shell.pieces.forEach((piece) => {
          piece.hexBaseColor = shell.hexBaseColor;
          piece.variation = shell.variation;
          if (piece.assetType !== "MAILBOX_FULL")
            loadTasks.push(
              processModel(piece).then((pieceModel) => {
                if (pieceModel) {
                  mainModel.add(pieceModel);
                }
              })
            );
        });
      }

      await Promise.all(loadTasks);

      scene.add(mainModel);

      applyProperties(mainModel, shell);
      handleDependencies(shell);
    })
  );
};

const parseHex = (hex) => {
  const decimal = parseInt(hex, 16);
  const r = decimal >> 16
  const g = decimal >> 8
  const b = decimal
  return [r, g, b].map(n => (n & 0xFF) / 255)
}

async function applyColor(model, baseHex, newHex) {
  const baseRGB = parseHex(baseHex)
  const newRGB = parseHex(newHex)

  model.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;

      if (geometry && geometry.attributes.color) {
        const colors = geometry.attributes.color.array; 
        const count = geometry.attributes.color.count;  
        const numPer = Math.round(colors.length / count);
        
        for (let i = 0; i < count; i++) {
          const r = colors[i * numPer + 0];
          const g = colors[i * numPer + 1];
          const b = colors[i * numPer + 2];

          if (
            Math.abs(r - baseRGB[0]) < 1e-4 &&
            Math.abs(g - baseRGB[1]) < 1e-4 &&
            Math.abs(b - baseRGB[2]) < 1e-4
          ) {
            colors[i * numPer] = newRGB[0];
            colors[i * numPer + 1] = newRGB[1];
            colors[i * numPer + 2] = newRGB[2];
          }
        }

        geometry.attributes.color.needsUpdate = true;
      }
    }
  });

  return model;
}