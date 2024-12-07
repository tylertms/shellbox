import { getConfig, setShells, getShells } from "../utils/config"
import loadShells from "../render/load";
import { apply } from "../utils/apply";

export default function populateVariations(set) {
  const config = getConfig();

  const shellSet = config.shellSets.find(s => s.identifier === set)
  var variations = shellSet?.variations
  const variationButtons = document.getElementById('variations')
  variationButtons.innerHTML = ''

  if (variations) {
    variationButtons.style.display = "flex";

    variations = [{ identifier: 'default', hexColor: shellSet.hexBaseColor }].concat(variations)

    variations.forEach(v => {
      const button = document.createElement('button');
      button.value = v.identifier;
      button.style.backgroundColor = "#" + v.hexColor
      button.classList.add('variation-button');

      button.addEventListener('click', (event) => {
        apply(set, 'variation-select', v)
      });

      variationButtons.appendChild(button);
    })
  } else {
    variationButtons.style.display = "none";
  }
}