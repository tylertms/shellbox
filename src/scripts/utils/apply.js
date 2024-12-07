import { getConfig, setDecorator, setShells, getShells } from "./config";
import { defaults, categoryMap, fileMap, farmElement } from "./constants";
import loadShells from "../render/load";
import { getBackup } from "../api/backup";

export async function apply(set, type, variation) {
  const config = getConfig();
  const backup = getBackup();

  switch (type) {
    case 'decorator-select':
      setDecorator(config.decorators.find(d => d.identifier === set))
      break;

    case 'set-select':
    case 'variation-select':
      var shellSet;
      if (variation) {
        shellSet = config.shellSets.find(s => s.identifier === set)
      }

      const shells = defaults.max.map((building, index) => {
        let shell = structuredClone(config.shells.find(shell => shell.setIdentifier === set && building.startsWith(shell.primaryPiece.assetType)));

        if (shell) {
          shell.index = index - defaults.max.indexOf(building);
          if (variation && shellSet) {
            shell.variation = variation;
            shell.hexBaseColor = shellSet.hexBaseColor;
          }
          return shell;
        }
        else if (!set.startsWith("sd_"))
          return {
            setIdentifier: set,
            building: building,
            index: index - defaults.max.indexOf(building),
            name: fileMap[building],
            category: categoryMap[building]
          };
      }).filter(shell => shell !== undefined);

      setShells(shells)
      break;

    case 'config-select':
      const savedConfigs = backup.shellDb.savedConfigsList.find(config => config.id == set).config
      const nonSetItems = savedConfigs.shellConfigsList
      const setItems = savedConfigs.shellSetConfigsList

      var configShells = [];
      nonSetItems.forEach(item => {
        let shellItem = structuredClone(config.shells.find(shell => shell.identifier === item.shellIdentifier));
        shellItem.index = 0;
        configShells.push(shellItem);
      });


      setItems.forEach(item => {
        let category = Object.keys(farmElement).find(key => farmElement[key] === item.element)

        if (category === 'GROUND' || category === 'HARDSCAPE') return;
        if (category === 'HYPERLOOP') category = 'HYPERLOOP_STOP'

        let building = defaults.max.find(building => categoryMap[building] === category)
        if (!building) return;

        let shellItem = structuredClone(config.shells.find(shell => shell.setIdentifier === item.shellSetIdentifier && building.startsWith(shell.primaryPiece.assetType)));
        shellItem.index = item.index

        if (item.decoratorIdentifier) {
          shellItem.decorator = config.decorators.find(d => d.identifier === item.decoratorIdentifier)
        }

        if (item.variationIdentifier) {
          const set = config.shellSets.find(s => s.identifier === item.shellSetIdentifier);
          if (set) {
            shellItem.hexBaseColor = set.hexBaseColor
            shellItem.variation = set.variations.find(v => v.identifier === item.variationIdentifier)
          }
        }
        configShells.push(shellItem)
      })

      setShells(configShells);
      break;
  }

  loadShells()
}
