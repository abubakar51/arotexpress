import { DBManager } from '../../server/db';

export async function getDB() {
  await DBManager.init();
  return DBManager;
}
