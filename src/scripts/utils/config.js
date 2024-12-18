import { URLs } from './constants.js';

let configCache = null;

export async function initConfig() {
  if (!configCache) {
    const response = await fetch(URLs.config);
    configCache = await response.json();
  }
  return configCache;
}

export function getConfig() {
  if (!configCache) {
    throw new Error('Config not initialized. Call initConfig() first.');
  }
  return configCache;
}


export var shells;
export function setShells(_shells) {
  _shells.forEach(_shell => {
    if (!_shell.decorator) _shell.decorator = decorator;
  })
  shells = _shells
}
export function getShells() {
  return shells;
}

export var decorator;
export function setDecorator(_decorator) {
  decorator = _decorator;
  shells.forEach(shell => {
    shell.decorator = _decorator
  });
}
export function getDecorator() {
  return decorator;
}
