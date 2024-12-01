import renderShells from "../render/render";
import { getMenuStates } from "../menu/states";

async function dropdownChange(event) {
  const states = getMenuStates();
  await renderShells(states);
}

export default dropdownChange;