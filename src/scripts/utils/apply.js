import { getConfig, setDecorator, setShells } from "./config";
import { defaults, categoryMap, fileMap, farmElement } from "./constants";
import loadShells from "../render/load";
import { getBackup } from "../api/backup";

export async function apply(set, type) {
  const config = getConfig();
  const backup = getBackup();

  switch (type) {
    case 'decorator-select':
      setDecorator(config.decorators.find(d => d.identifier === set))
      break;

    case 'set-select':
      const shells = defaults.max.map((building, index) => {
        let shell = structuredClone(config.shells.find(shell => shell.setIdentifier === set && building.startsWith(shell.primaryPiece.assetType)));

        if (shell) {
          shell.index = index - defaults.max.indexOf(building);
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
      
      let hyperloopTrack = structuredClone(setItems.find(item => item.element === 7))
      hyperloopTrack.index = 1
      setItems.push(hyperloopTrack)

      setItems.forEach(item => {
        let category = Object.keys(farmElement).find(key => farmElement[key] === item.element)
        if (category === 'GROUND' || category === 'HARDSCAPE') return;

        if (category === 'HYPERLOOP') {
          if (item.index === 0) {
            category = 'HYPERLOOP_STOP';
          } else {
            category = 'HYPERLOOP_TRACK'
          }
        }

        let building = defaults.max.find(building => categoryMap[building] === category)
        if (!building) return;

        let shellItem = structuredClone(config.shells.find(shell => shell.setIdentifier === item.shellSetIdentifier && building.startsWith(shell.primaryPiece.assetType)));
        shellItem.index = item.index

        if (item.decoratorIdentifier) {
          shellItem.decorator = config.decorators.find(d => d.identifier === item.decoratorIdentifier)
        }
        configShells.push(shellItem)
      })

      setShells(configShells);
      break;
  }

  loadShells()
}
