import { URLs } from './constants.js';

async function fetchShellConfig() {
  const response = await fetch(URLs.shells);
  const data = await response.text();

  return data.split('\n').reduce((shells, row) => {
    const columns = row.split('|');
    if (columns.length >= 5 && columns[0] === 'shell') {
      const [type, set, building, name, id, size] = [
        columns[0],
        ...columns[1].split(' - '),
        columns[2],
        columns[3],
        columns[4],
      ];
      shells.push({ type, set, building, name, id, size });
    }
    return shells;
  }, []);
};

export default fetchShellConfig;