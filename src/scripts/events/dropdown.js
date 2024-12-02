import { defaults } from "../utils/constants";
import { getConfig } from "../utils/config";
import renderShells from "../render/render";
import { fileMap, categoryMap } from "../utils/constants";


async function dropdownChange(event) {
  const config = getConfig();
  const shells = defaults.max.map(building => {
    if (building === "HYPERLOOP_TRACK") return;
    if (building === "HYPERLOOP_STOP") building = "HYPERLOOP";
    
    return config.shells.find(shell => shell.setIdentifier === event.target.value && shell.primaryPiece.assetType === building)
      || {
      set: 'Default',
      building: building,
      name: fileMap[building],
      category: categoryMap[building]
    };
  }).filter(shell => shell !== undefined);

  console.log("Rendering shells:", shells);

  await renderShells(shells);
}

export default dropdownChange;