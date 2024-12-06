import * as ei from '../../proto/ei_pb'
import { URLs } from '../utils/constants';

var backup = null;

export async function fetchBackup(EID) {
  try {
    const backupResponse = await fetch(URLs.ei_worker + 'backup?EID=' + EID)
    backup = await backupResponse.json()

    if (!backup.userName) throw "Invalid EID.";

    return {
      success: true,
      message: "Successfully signed in as \"" + backup.userName + "\"."
    }
  } catch (err) {
    return {
      success: false,
      message: "Failed to sign in. Please check your EID and try again."
    }
  }
}

export function getBackup() {
  return backup;
}

export function setBackup(_backup) {
  backup = _backup;
}