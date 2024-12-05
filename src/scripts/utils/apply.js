import { getConfig, setDecorator, setShells } from "./config";
import { defaults, categoryMap, fileMap } from "./constants";
import loadShells from "../render/load";

export async function applySet(set) {
  const config = getConfig();

  if (set.startsWith("sd_")) {
    setDecorator(config.decorators.find(d => d.identifier = set))
  } else {
    const shells = defaults.max.map((building, index) => {
      let shell = config.shells.find(shell => shell.setIdentifier === set && building.startsWith(shell.primaryPiece.assetType));

      if (shell) return shell;
      else if (!set.startsWith("sd_"))
        return {
          setIdentifier: set,
          building: building,
          name: fileMap[building],
          category: categoryMap[building]
        };
    }).filter(shell => shell !== undefined);

    setShells(shells)
  }

  loadShells()
}
