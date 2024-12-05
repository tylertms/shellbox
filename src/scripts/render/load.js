import { GLTFLoader } from "three/examples/jsm/Addons.js";
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

// Function to generate a URI for a given shell or piece
const getUri = async (shell) => {
  try {
    if (!shell.identifier && !shell.dlc) {
      // Handle shells without an identifier
      shell.name = shell.name || fileMap[shell.building];
      if (!shell.name) return null;

      const response = await fetch(`${URLs.r2}${shell.name}.glb`);
      if (!response.ok) throw new Error(`Failed to fetch ${shell.name}.glb`);
      const buffer = await response.arrayBuffer();
      return URL.createObjectURL(new Blob([buffer]));
    } else {
      // Handle shells with an identifier (possibly DLC)
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

// Function to process and load a single shell or piece
const processModel = async (shell) => {
  const uri = await getUri(shell);
  if (!uri) return null;
  try {
    const model = await loadGltf(uri);
    URL.revokeObjectURL(uri); // Clean up the object URL after loading
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

// Main function to handle all shells
export default async function loadShells() {
  let shells = getShells();
  let decorator = getDecorator();

  clearShells();

  await Promise.all(
    shells.map(async (shell) => {
      const mainModel = await processModel(shell);
      if (!mainModel) return;

      const loadTasks = [];

      // Handle decorator if applicable
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

      // Handle shell.pieces if they exist
      if (Array.isArray(shell.pieces) && shell.pieces.length > 0) {
        shell.pieces.forEach((piece) => {
          loadTasks.push(
            processModel(piece).then((pieceModel) => {
              if (pieceModel) {
                mainModel.add(pieceModel);
              }
            })
          );
        });
      }

      // Await all decorator and pieces to load in parallel
      await Promise.all(loadTasks);

      // Add the fully assembled model to the scene
      scene.add(mainModel);

      // Apply additional properties and handle dependencies
      applyProperties(mainModel, shell);
      handleDependencies(shell);
    })
  );
};