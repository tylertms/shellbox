import { getConfig } from "./config";
import { defaults, categoryMap, fileMap } from "./constants";
import renderShells from "../render/render";

export default async function applySet(set) {
  const config = getConfig();
  const shells = defaults.max.map(building => {
    if (building === "HYPERLOOP_TRACK") return;
    if (building === "HYPERLOOP_STOP") building = "HYPERLOOP";
    
    return config.shells.find(shell => shell.setIdentifier === set && shell.primaryPiece.assetType === building)
      || {
      set: 'Default',
      building: building,
      name: fileMap[building],
      category: categoryMap[building]
    };
  }).filter(shell => shell !== undefined);

  await renderShells(shells);
}