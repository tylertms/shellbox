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